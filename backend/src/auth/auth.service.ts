import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokensService } from './refresh-tokens.service';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  name: string;
}

interface SessionContext {
  userAgent?: string | null;
  ipAddress?: string | null;
}

interface IssuedTokens {
  token: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private refreshTokens: RefreshTokensService,
  ) {}

  async register(dto: RegisterDto, ctx: SessionContext = {}) {
    const exists = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('Email already registered');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    // Use the row returned from save() — TypeORM mutates in place but tests assume
    // pure functions, and relying on the explicit return is more robust either way.
    const created = this.usersRepository.create({
      ...dto,
      password: hashedPassword,
    });
    const user = await this.usersRepository.save(created);

    const { password: _password, ...result } = user;
    const tokens = await this.issueTokens(user, ctx);
    return { user: result, ...tokens };
  }

  async login(dto: LoginDto, ctx: SessionContext = {}) {
    const user = await this.usersRepository.findOne({
      where: { email: dto.email },
      select: ['id', 'name', 'email', 'password', 'role', 'isActive'],
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const { password: _password, ...result } = user;
    const tokens = await this.issueTokens(user, ctx);
    return { user: result, ...tokens };
  }

  /**
   * Rotate a presented refresh token and issue a new access token alongside.
   * Token reuse detection lives in RefreshTokensService.rotate().
   */
  async refresh(
    presentedRefreshToken: string,
    ctx: SessionContext = {},
  ): Promise<IssuedTokens> {
    const { userId, rawToken } = await this.refreshTokens.rotate(
      presentedRefreshToken,
      ctx,
    );
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user || !user.isActive) {
      // Belt-and-braces: revoke the freshly-issued token, then fail.
      await this.refreshTokens.revoke(rawToken);
      throw new UnauthorizedException('User no longer active');
    }
    return { token: this.signAccessToken(user), refreshToken: rawToken };
  }

  /** Revoke just the presented session. */
  logout(rawRefreshToken: string | undefined): Promise<void> {
    return this.refreshTokens.revoke(rawRefreshToken);
  }

  /** Revoke every active session for the user (used for "sign out everywhere"). */
  logoutAll(userId: string): Promise<void> {
    return this.refreshTokens.revokeAllForUser(userId);
  }

  private async issueTokens(
    user: User,
    ctx: SessionContext,
  ): Promise<IssuedTokens> {
    const refreshToken = await this.refreshTokens.issueForUser(user.id, ctx);
    return { token: this.signAccessToken(user), refreshToken };
  }

  private signAccessToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    return this.jwtService.sign(payload);
  }
}

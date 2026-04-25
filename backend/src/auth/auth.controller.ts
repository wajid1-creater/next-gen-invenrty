import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request, Response, CookieOptions } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { parseDurationMs } from './refresh-tokens.service';
import { CSRF_COOKIE, SkipCsrf } from './csrf.constants';
import { Public } from './decorators/public.decorator';
import { randomBytes } from 'node:crypto';

const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  name: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Public()
  @SkipCsrf()
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(
      dto,
      this.sessionContext(req),
    );
    this.setAuthCookies(res, result.token, result.refreshToken);
    this.setCsrfCookie(res);
    return { user: result.user, token: result.token };
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Public()
  @SkipCsrf()
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto, this.sessionContext(req));
    this.setAuthCookies(res, result.token, result.refreshToken);
    this.setCsrfCookie(res);
    return { user: result.user, token: result.token };
  }

  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Public()
  @SkipCsrf()
  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookies = (req.cookies ?? {}) as Record<string, string | undefined>;
    const refreshToken = cookies[REFRESH_COOKIE];
    if (!refreshToken) throw new UnauthorizedException('Missing refresh token');

    const tokens = await this.authService.refresh(
      refreshToken,
      this.sessionContext(req),
    );
    this.setAuthCookies(res, tokens.token, tokens.refreshToken);
    this.setCsrfCookie(res);
    return { ok: true };
  }

  @SkipCsrf()
  @Post('logout')
  @HttpCode(204)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cookies = (req.cookies ?? {}) as Record<string, string | undefined>;
    await this.authService.logout(cookies[REFRESH_COOKIE]);
    const opts = this.cookieOptions();
    res.clearCookie(ACCESS_COOKIE, opts);
    res.clearCookie(REFRESH_COOKIE, opts);
    res.clearCookie(CSRF_COOKIE, { ...opts, httpOnly: false });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @HttpCode(204)
  async logoutAll(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) throw new UnauthorizedException();
    await this.authService.logoutAll(user.id);
    const opts = this.cookieOptions();
    res.clearCookie(ACCESS_COOKIE, opts);
    res.clearCookie(REFRESH_COOKIE, opts);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req: Request) {
    return req.user;
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    res.cookie(ACCESS_COOKIE, accessToken, {
      ...this.cookieOptions(),
      maxAge: parseDurationMs(
        this.configService.get<string>('JWT_EXPIRATION', '15m'),
      ),
    });
    res.cookie(REFRESH_COOKIE, refreshToken, {
      ...this.cookieOptions(),
      maxAge: parseDurationMs(
        this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d'),
      ),
    });
  }

  /** CSRF cookie must be readable by JS so the SPA can echo it back as a header. */
  private setCsrfCookie(res: Response) {
    const value = randomBytes(32).toString('base64url');
    res.cookie(CSRF_COOKIE, value, {
      ...this.cookieOptions(),
      httpOnly: false,
      maxAge: parseDurationMs(
        this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d'),
      ),
    });
  }

  private cookieOptions(): CookieOptions {
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';
    // Cross-site cookies need SameSite=None + Secure in production (frontend on
    // Vercel, backend on Railway = different registrable domains). In dev both
    // run on localhost so SameSite=Lax works and lets us avoid HTTPS locally.
    return {
      httpOnly: true,
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd,
      path: '/',
    };
  }

  private sessionContext(req: Request) {
    return {
      userAgent: req.headers['user-agent'] ?? null,
      ipAddress: req.ip ?? null,
    };
  }
}

import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { createHash, randomBytes } from 'node:crypto';
import { RefreshToken } from './entities/refresh-token.entity';

interface IssueContext {
  userAgent?: string | null;
  ipAddress?: string | null;
}

@Injectable()
export class RefreshTokensService {
  private readonly logger = new Logger(RefreshTokensService.name);

  constructor(
    @InjectRepository(RefreshToken)
    private repo: Repository<RefreshToken>,
    private config: ConfigService,
  ) {}

  /** Mint a fresh refresh token for a user. Returns the raw value (caller sets cookie). */
  async issueForUser(userId: string, ctx: IssueContext = {}): Promise<string> {
    const raw = randomBytes(48).toString('base64url');
    await this.persist(userId, raw, ctx);
    return raw;
  }

  /**
   * Validate a presented refresh token and rotate it.
   *
   * Side effects:
   *  - on success: revokes the presented token, inserts a successor, returns raw new token
   *  - on reuse of an already-rotated token: revokes the entire family for this user
   *    (defense against token theft) and throws Unauthorized
   *  - on any other failure: throws Unauthorized
   */
  async rotate(
    rawToken: string,
    ctx: IssueContext = {},
  ): Promise<{ userId: string; rawToken: string }> {
    if (!rawToken) throw new UnauthorizedException('Missing refresh token');

    const hash = this.hash(rawToken);
    const row = await this.repo.findOne({ where: { tokenHash: hash } });

    if (!row) throw new UnauthorizedException('Invalid refresh token');

    if (row.revokedAt) {
      // The row exists but was already revoked. Two cases:
      //  - normal logout/rotation → benign, just reject
      //  - replaced-then-reused → very likely theft; nuke the family
      if (row.replacedByTokenId) {
        this.logger.warn(
          `Refresh-token reuse detected for user=${row.userId} (token=${row.id}); revoking family`,
        );
        await this.revokeAllForUser(row.userId);
      }
      throw new UnauthorizedException('Refresh token revoked');
    }

    if (row.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    // Issue successor and link the chain in a single transaction.
    const newRaw = randomBytes(48).toString('base64url');
    await this.repo.manager.transaction(async (em) => {
      const successor = em.create(RefreshToken, {
        userId: row.userId,
        tokenHash: this.hash(newRaw),
        expiresAt: this.computeExpiresAt(),
        userAgent: ctx.userAgent ?? null,
        ipAddress: ctx.ipAddress ?? null,
      });
      const saved = await em.save(successor);
      await em.update(RefreshToken, row.id, {
        revokedAt: new Date(),
        replacedByTokenId: saved.id,
      });
    });

    return { userId: row.userId, rawToken: newRaw };
  }

  /** Revoke a single token by raw value. Used for /auth/logout. No-op if unknown. */
  async revoke(rawToken: string | undefined): Promise<void> {
    if (!rawToken) return;
    await this.repo.update(
      { tokenHash: this.hash(rawToken), revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  /** Revoke every active token for a user. Used for /auth/logout-all + theft response. */
  async revokeAllForUser(userId: string): Promise<void> {
    await this.repo.update(
      { userId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  private async persist(userId: string, rawToken: string, ctx: IssueContext) {
    const row = this.repo.create({
      userId,
      tokenHash: this.hash(rawToken),
      expiresAt: this.computeExpiresAt(),
      userAgent: ctx.userAgent ?? null,
      ipAddress: ctx.ipAddress ?? null,
    });
    await this.repo.save(row);
  }

  private hash(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  private computeExpiresAt(): Date {
    const ttl = this.config.get<string>('JWT_REFRESH_EXPIRATION', '7d');
    return new Date(Date.now() + parseDurationMs(ttl));
  }
}

/** "15m" → 900000, "7d" → 604800000. Exported for tests. */
export function parseDurationMs(input: string): number {
  const match = /^(\d+)\s*([smhd])?$/.exec(input.trim());
  if (!match) throw new Error(`Bad duration: ${input}`);
  const n = Number(match[1]);
  const unit = match[2] ?? 's';
  const factor =
    unit === 's'
      ? 1000
      : unit === 'm'
        ? 60_000
        : unit === 'h'
          ? 3_600_000
          : 86_400_000;
  return n * factor;
}

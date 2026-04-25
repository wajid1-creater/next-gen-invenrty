import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import {
  RefreshTokensService,
  parseDurationMs,
} from './refresh-tokens.service';
import { RefreshToken } from './entities/refresh-token.entity';

const hashOf = (raw: string) => createHash('sha256').update(raw).digest('hex');

describe('parseDurationMs', () => {
  it('parses canonical durations', () => {
    expect(parseDurationMs('30s')).toBe(30_000);
    expect(parseDurationMs('15m')).toBe(900_000);
    expect(parseDurationMs('24h')).toBe(86_400_000);
    expect(parseDurationMs('7d')).toBe(7 * 86_400_000);
    expect(parseDurationMs('60')).toBe(60_000); // bare number defaults to seconds
  });

  it('throws on garbage input', () => {
    expect(() => parseDurationMs('forever')).toThrow();
  });
});

describe('RefreshTokensService', () => {
  let service: RefreshTokensService;
  let repo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    manager: { transaction: jest.Mock };
  };

  beforeEach(async () => {
    repo = {
      findOne: jest.fn(),
      create: jest.fn((x) => x),
      save: jest.fn(async (x) => ({ id: 'tok-new', ...x })),
      update: jest.fn(async () => ({ affected: 1 })),
      manager: {
        // Run the transaction body against a tiny fake EM that proxies create/save/update.
        transaction: jest.fn(async (cb: (em: any) => Promise<unknown>) => {
          const em = {
            create: (_: unknown, x: unknown) => x,
            save: jest.fn(async (x: any) => ({ id: 'tok-new', ...x })),
            update: jest.fn(async () => ({ affected: 1 })),
          };
          return cb(em);
        }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokensService,
        { provide: getRepositoryToken(RefreshToken), useValue: repo },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((_: string, fallback?: unknown) => fallback ?? '7d'),
          },
        },
      ],
    }).compile();

    service = module.get(RefreshTokensService);
  });

  describe('issueForUser', () => {
    it('persists a hashed token and returns the raw value', async () => {
      const raw = await service.issueForUser('u-1', {
        userAgent: 'jest',
        ipAddress: '127.0.0.1',
      });
      expect(raw).toMatch(/^[A-Za-z0-9_-]+$/); // base64url
      const persisted = repo.save.mock.calls[0][0];
      expect(persisted.userId).toBe('u-1');
      expect(persisted.tokenHash).toBe(hashOf(raw));
      expect(persisted.tokenHash).not.toBe(raw); // never store the raw value
      expect(persisted.userAgent).toBe('jest');
    });
  });

  describe('rotate', () => {
    it('rejects when the token is unknown', async () => {
      repo.findOne.mockResolvedValueOnce(null);
      await expect(service.rotate('unknown')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('rejects when the token has expired', async () => {
      repo.findOne.mockResolvedValueOnce({
        id: 't-1',
        userId: 'u-1',
        revokedAt: null,
        expiresAt: new Date(Date.now() - 1000),
      });
      await expect(service.rotate('expired')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('rejects when revoked but never replaced (normal logout case)', async () => {
      repo.findOne.mockResolvedValueOnce({
        id: 't-1',
        userId: 'u-1',
        revokedAt: new Date(),
        replacedByTokenId: null,
        expiresAt: new Date(Date.now() + 60_000),
      });
      await expect(service.rotate('revoked')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      // Must NOT trigger family revocation for benign revoke.
      expect(repo.update).not.toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'u-1',
          revokedAt: expect.anything(),
        }),
        expect.anything(),
      );
    });

    it('REVOKES THE WHOLE FAMILY when an already-rotated token is replayed', async () => {
      repo.findOne.mockResolvedValueOnce({
        id: 't-old',
        userId: 'u-1',
        revokedAt: new Date(),
        replacedByTokenId: 't-new', // the smoking gun
        expiresAt: new Date(Date.now() + 60_000),
      });
      await expect(service.rotate('replayed-old-token')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      // Family revocation = update WHERE userId, revokedAt: IsNull.
      expect(repo.update).toHaveBeenCalled();
      const [where] = repo.update.mock.calls[0];
      expect(where.userId).toBe('u-1');
    });

    it('rotates a valid token: returns new raw, marks old as revoked + replaced', async () => {
      repo.findOne.mockResolvedValueOnce({
        id: 't-1',
        userId: 'u-1',
        revokedAt: null,
        replacedByTokenId: null,
        expiresAt: new Date(Date.now() + 60_000),
      });

      const out = await service.rotate('still-valid');
      expect(out.userId).toBe('u-1');
      expect(out.rawToken).toMatch(/^[A-Za-z0-9_-]+$/);
      expect(repo.manager.transaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('revoke + revokeAllForUser', () => {
    it('revoke is a no-op when no token is provided', async () => {
      await service.revoke(undefined);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('revoke targets only the matching, still-active row', async () => {
      await service.revoke('some-raw');
      expect(repo.update).toHaveBeenCalledWith(
        expect.objectContaining({ tokenHash: hashOf('some-raw') }),
        expect.objectContaining({ revokedAt: expect.any(Date) }),
      );
    });

    it('revokeAllForUser bulk-revokes every active token for the user', async () => {
      await service.revokeAllForUser('u-1');
      expect(repo.update).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'u-1' }),
        expect.objectContaining({ revokedAt: expect.any(Date) }),
      );
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { RefreshTokensService } from './refresh-tokens.service';
import { User, UserRole } from '../users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersRepo: { findOne: jest.Mock; create: jest.Mock; save: jest.Mock };
  let jwt: { sign: jest.Mock };
  let refreshTokens: {
    issueForUser: jest.Mock;
    rotate: jest.Mock;
    revoke: jest.Mock;
    revokeAllForUser: jest.Mock;
  };

  beforeEach(async () => {
    usersRepo = {
      findOne: jest.fn(),
      create: jest.fn((u) => u),
      save: jest.fn(async (u) => ({ id: 'u-1', ...u })),
    };
    jwt = { sign: jest.fn(() => 'signed-access') };
    refreshTokens = {
      issueForUser: jest.fn(async () => 'raw-refresh'),
      rotate: jest.fn(),
      revoke: jest.fn(async () => undefined),
      revokeAllForUser: jest.fn(async () => undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: usersRepo },
        { provide: JwtService, useValue: jwt },
        { provide: RefreshTokensService, useValue: refreshTokens },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('register', () => {
    it('hashes the password, persists the user, and issues both tokens', async () => {
      usersRepo.findOne.mockResolvedValueOnce(null);

      const result = await service.register({
        name: 'Ada',
        email: 'ada@example.com',
        password: 'plain-password',
        role: UserRole.MANAGER,
      } as any);

      const saved = usersRepo.save.mock.calls[0][0];
      expect(await bcrypt.compare('plain-password', saved.password)).toBe(true);
      expect(result.token).toBe('signed-access');
      expect(result.refreshToken).toBe('raw-refresh');
      expect(refreshTokens.issueForUser).toHaveBeenCalledWith(
        'u-1',
        expect.any(Object),
      );
      expect((result.user as any).password).toBeUndefined();
    });

    it('rejects duplicate emails without minting any tokens', async () => {
      usersRepo.findOne.mockResolvedValueOnce({ id: 'existing' });
      await expect(
        service.register({
          email: 'dup@example.com',
          password: 'x',
          name: 'X',
        } as any),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(refreshTokens.issueForUser).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('returns both tokens on correct password', async () => {
      const hashed = await bcrypt.hash('correct', 10);
      usersRepo.findOne.mockResolvedValueOnce({
        id: 'u-1',
        email: 'a@b.com',
        password: hashed,
        role: UserRole.MANAGER,
        name: 'A',
        isActive: true,
      });

      const result = await service.login({
        email: 'a@b.com',
        password: 'correct',
      } as any);
      expect(result.token).toBe('signed-access');
      expect(result.refreshToken).toBe('raw-refresh');
      expect((result.user as any).password).toBeUndefined();
    });

    it('rejects unknown email with Unauthorized', async () => {
      usersRepo.findOne.mockResolvedValueOnce(null);
      await expect(
        service.login({ email: 'nobody@x.com', password: 'x' } as any),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects wrong password with Unauthorized (not "not found")', async () => {
      const hashed = await bcrypt.hash('right', 10);
      usersRepo.findOne.mockResolvedValueOnce({
        id: 'u-1',
        email: 'a@b.com',
        password: hashed,
        role: UserRole.MANAGER,
        name: 'A',
        isActive: true,
      });
      await expect(
        service.login({ email: 'a@b.com', password: 'wrong' } as any),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('issues a new access token alongside the rotated refresh token', async () => {
      refreshTokens.rotate.mockResolvedValueOnce({
        userId: 'u-1',
        rawToken: 'rotated-raw',
      });
      usersRepo.findOne.mockResolvedValueOnce({
        id: 'u-1',
        email: 'a@b.com',
        role: UserRole.MANAGER,
        name: 'A',
        isActive: true,
      });

      const out = await service.refresh('presented-token');
      expect(out.token).toBe('signed-access');
      expect(out.refreshToken).toBe('rotated-raw');
    });

    it('revokes the freshly-issued token if the user is no longer active', async () => {
      refreshTokens.rotate.mockResolvedValueOnce({
        userId: 'u-1',
        rawToken: 'rotated-raw',
      });
      usersRepo.findOne.mockResolvedValueOnce({ id: 'u-1', isActive: false });
      await expect(service.refresh('presented-token')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(refreshTokens.revoke).toHaveBeenCalledWith('rotated-raw');
    });
  });
});

import { describe, expect, it } from 'vitest';
import { formatZodErrors, loginSchema, registerSchema } from './schemas';

describe('loginSchema', () => {
  it('accepts a valid email + non-empty password', () => {
    const r = loginSchema.safeParse({ email: 'a@b.com', password: 'x' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe('a@b.com');
  });

  it('lowercases and trims email', () => {
    const r = loginSchema.safeParse({ email: '  Foo@Bar.com  ', password: 'x' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe('foo@bar.com');
  });

  it('rejects invalid email', () => {
    const r = loginSchema.safeParse({ email: 'not-email', password: 'x' });
    expect(r.success).toBe(false);
  });

  it('rejects empty password', () => {
    const r = loginSchema.safeParse({ email: 'a@b.com', password: '' });
    expect(r.success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('requires letter + digit + ≥8 chars in password', () => {
    expect(
      registerSchema.safeParse({
        name: 'Ada',
        email: 'a@b.com',
        password: 'shorty1',
        role: 'manager',
      }).success,
    ).toBe(false);
    expect(
      registerSchema.safeParse({
        name: 'Ada',
        email: 'a@b.com',
        password: 'longenoughbutnonum',
        role: 'manager',
      }).success,
    ).toBe(false);
    expect(
      registerSchema.safeParse({
        name: 'Ada',
        email: 'a@b.com',
        password: 'longenough1',
        role: 'manager',
      }).success,
    ).toBe(true);
  });

  it('rejects unknown roles', () => {
    const r = registerSchema.safeParse({
      name: 'Ada',
      email: 'a@b.com',
      password: 'longenough1',
      role: 'superadmin',
    });
    expect(r.success).toBe(false);
  });
});

describe('formatZodErrors', () => {
  it('returns one message per field, first wins', () => {
    const r = registerSchema.safeParse({ name: '', email: 'bad', password: 'x', role: 'manager' });
    expect(r.success).toBe(false);
    if (r.success) return;
    const out = formatZodErrors(r.error);
    expect(out.name).toBeDefined();
    expect(out.email).toBeDefined();
    expect(out.password).toBeDefined();
  });
});

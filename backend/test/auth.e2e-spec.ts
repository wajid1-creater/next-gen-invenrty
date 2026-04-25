import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { buildTestApp, truncateAllTables } from './setup-app';

describe('Auth flow (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await buildTestApp();
  });
  afterAll(async () => {
    await app.close();
  });
  beforeEach(async () => {
    await truncateAllTables(app);
  });

  function http() {
    return request(app.getHttpServer() as App);
  }

  /** Register a fresh user and return the agent + cookie jar. */
  async function registered(
    overrides: Partial<{ email: string; password: string }> = {},
  ) {
    const agent = request.agent(app.getHttpServer() as App);
    const res = await agent.post('/api/auth/register').send({
      name: 'E2E User',
      email: overrides.email ?? 'e2e@example.com',
      password: overrides.password ?? 'password123',
    });
    expect(res.status).toBe(201);
    return agent;
  }

  it('register issues access + refresh + csrf cookies', async () => {
    const res = await http().post('/api/auth/register').send({
      name: 'Ada',
      email: 'ada@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('ada@example.com');
    expect(res.body.user.password).toBeUndefined();

    const cookies = (res.headers['set-cookie'] as unknown as string[]) ?? [];
    const cookieNames = cookies.map((c) => c.split('=')[0]);
    expect(cookieNames).toEqual(
      expect.arrayContaining(['access_token', 'refresh_token', 'csrf_token']),
    );
    // Access + refresh must be HttpOnly. CSRF must NOT be (frontend reads it).
    expect(cookies.find((c) => c.startsWith('access_token'))).toMatch(
      /HttpOnly/i,
    );
    expect(cookies.find((c) => c.startsWith('refresh_token'))).toMatch(
      /HttpOnly/i,
    );
    expect(cookies.find((c) => c.startsWith('csrf_token'))).not.toMatch(
      /HttpOnly/i,
    );
  });

  it('rejects duplicate email registration with 409', async () => {
    await http()
      .post('/api/auth/register')
      .send({ name: 'A', email: 'dup@example.com', password: 'password123' });

    const res = await http()
      .post('/api/auth/register')
      .send({ name: 'B', email: 'dup@example.com', password: 'password123' });
    expect(res.status).toBe(409);
  });

  it('login succeeds with correct password and returns 401 otherwise', async () => {
    await http()
      .post('/api/auth/register')
      .send({ name: 'A', email: 'a@b.com', password: 'password123' });

    const ok = await http()
      .post('/api/auth/login')
      .send({ email: 'a@b.com', password: 'password123' });
    expect(ok.status).toBe(201);

    const bad = await http()
      .post('/api/auth/login')
      .send({ email: 'a@b.com', password: 'wrong' });
    expect(bad.status).toBe(401);

    const missing = await http()
      .post('/api/auth/login')
      .send({ email: 'nobody@x.com', password: 'x' });
    expect(missing.status).toBe(401);
  });

  it('GET /api/auth/me works with the session cookie and 401s without it', async () => {
    const agent = await registered();

    const me = await agent.get('/api/auth/me');
    expect(me.status).toBe(200);
    expect(me.body.email).toBe('e2e@example.com');

    const no = await http().get('/api/auth/me');
    expect(no.status).toBe(401);
  });

  it('rotates the refresh cookie on /api/auth/refresh', async () => {
    const reg = await http().post('/api/auth/register').send({
      name: 'R',
      email: 'rotate@example.com',
      password: 'password123',
    });
    const beforeCookies =
      (reg.headers['set-cookie'] as unknown as string[]) ?? [];
    const beforeRefresh = beforeCookies
      .find((c) => c.startsWith('refresh_token='))
      ?.split(';')[0];
    expect(beforeRefresh).toBeTruthy();

    const refreshed = await http()
      .post('/api/auth/refresh')
      .set('Cookie', beforeRefresh!);
    expect(refreshed.status).toBe(200);

    const afterCookies =
      (refreshed.headers['set-cookie'] as unknown as string[]) ?? [];
    const afterRefresh = afterCookies
      .find((c) => c.startsWith('refresh_token='))
      ?.split(';')[0];
    expect(afterRefresh).toBeTruthy();
    expect(afterRefresh).not.toBe(beforeRefresh);
  });

  it('detects refresh-token reuse and revokes the family', async () => {
    // Register and capture the original refresh cookie value before rotation.
    const reg = await http().post('/api/auth/register').send({
      name: 'V',
      email: 'victim@example.com',
      password: 'password123',
    });
    const originalCookies =
      (reg.headers['set-cookie'] as unknown as string[]) ?? [];
    const originalRefresh = originalCookies
      .find((c) => c.startsWith('refresh_token'))
      ?.split(';')[0];
    expect(originalRefresh).toBeTruthy();

    // Legitimate user rotates once → original is now revoked + replaced.
    const rotated = await http()
      .post('/api/auth/refresh')
      .set('Cookie', originalRefresh!);
    expect(rotated.status).toBe(200);

    // Attacker replays the captured-pre-rotation token → server should reject AND
    // the new (legitimate) token should also be invalidated as theft response.
    const newCookies =
      (rotated.headers['set-cookie'] as unknown as string[]) ?? [];
    const newRefresh = newCookies
      .find((c) => c.startsWith('refresh_token'))
      ?.split(';')[0];

    const replay = await http()
      .post('/api/auth/refresh')
      .set('Cookie', originalRefresh!);
    expect(replay.status).toBe(401);

    const legitAfterTheft = await http()
      .post('/api/auth/refresh')
      .set('Cookie', newRefresh!);
    expect(legitAfterTheft.status).toBe(401);
  });

  it('logout clears cookies and revokes the session', async () => {
    const agent = await registered();
    const out = await agent.post('/api/auth/logout');
    expect(out.status).toBe(204);

    // Cookies cleared (Set-Cookie with Expires in past).
    const setCookies = (out.headers['set-cookie'] as unknown as string[]) ?? [];
    expect(setCookies.find((c) => c.startsWith('access_token'))).toMatch(
      /Expires=/i,
    );
    expect(setCookies.find((c) => c.startsWith('refresh_token'))).toMatch(
      /Expires=/i,
    );
  });
});

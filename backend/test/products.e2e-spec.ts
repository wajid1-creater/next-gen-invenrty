import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { buildTestApp, truncateAllTables } from './setup-app';

describe('Products (e2e)', () => {
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

  /** Register and pull out the CSRF token so write requests can echo it back. */
  async function authedAgent() {
    const agent = request.agent(app.getHttpServer() as App);
    const res = await agent.post('/api/auth/register').send({
      name: 'Tester',
      email: 'tester@example.com',
      password: 'password123',
    });
    const setCookies = (res.headers['set-cookie'] as unknown as string[]) ?? [];
    const csrf = setCookies
      .find((c) => c.startsWith('csrf_token='))
      ?.split(';')[0]
      ?.split('=')[1];
    if (!csrf) throw new Error('no csrf cookie');
    return { agent, csrf };
  }

  it('rejects writes without CSRF header (403) but allows reads', async () => {
    const { agent } = await authedAgent();

    const writeNoCsrf = await agent
      .post('/api/products')
      .send({ name: 'X', sku: 'X1', unitPrice: 1 });
    expect(writeNoCsrf.status).toBe(403);

    const read = await agent.get('/api/products');
    expect(read.status).toBe(200);
  });

  it('CRUDs a product and increments pagination total', async () => {
    const { agent, csrf } = await authedAgent();

    const created = await agent
      .post('/api/products')
      .set('X-CSRF-Token', csrf)
      .send({
        name: 'Widget',
        sku: 'WID-001',
        unitPrice: 9.99,
        currentStock: 3,
        reorderLevel: 1,
      });
    expect(created.status).toBe(201);
    const id = created.body.id as string;

    const list = await agent.get('/api/products');
    expect(list.status).toBe(200);
    expect(list.body.items).toHaveLength(1);
    expect(list.body.total).toBe(1);
    expect(list.body.page).toBe(1);
    expect(list.body.totalPages).toBe(1);
    expect(list.body.items[0].name).toBe('Widget');

    const got = await agent.get(`/api/products/${id}`);
    expect(got.status).toBe(200);
    expect(got.body.sku).toBe('WID-001');

    const patched = await agent
      .patch(`/api/products/${id}`)
      .set('X-CSRF-Token', csrf)
      .send({ currentStock: 99 });
    expect(patched.status).toBe(200);
    expect(patched.body.currentStock).toBe(99);

    const removed = await agent
      .delete(`/api/products/${id}`)
      .set('X-CSRF-Token', csrf);
    expect(removed.status).toBe(200);

    const listAfter = await agent.get('/api/products');
    expect(listAfter.body.total).toBe(0);
  });

  it('paginates correctly with page + pageSize and respects q search', async () => {
    const { agent, csrf } = await authedAgent();

    for (let i = 0; i < 5; i++) {
      await agent
        .post('/api/products')
        .set('X-CSRF-Token', csrf)
        .send({ name: `Bulk ${i}`, sku: `BULK-${i}`, unitPrice: i });
    }
    await agent
      .post('/api/products')
      .set('X-CSRF-Token', csrf)
      .send({ name: 'Special', sku: 'SPC-1', unitPrice: 1 });

    const page1 = await agent
      .get('/api/products')
      .query({ page: 1, pageSize: 2 });
    expect(page1.status).toBe(200);
    expect(page1.body.total).toBe(6);
    expect(page1.body.items).toHaveLength(2);
    expect(page1.body.totalPages).toBe(3);

    const page2 = await agent
      .get('/api/products')
      .query({ page: 2, pageSize: 2 });
    expect(page2.body.items).toHaveLength(2);
    expect(page2.body.items[0].id).not.toBe(page1.body.items[0].id);

    const search = await agent.get('/api/products').query({ q: 'Special' });
    expect(search.body.total).toBe(1);
    expect(search.body.items[0].name).toBe('Special');
  });

  it('caps pageSize at 100 (rejects 101)', async () => {
    const { agent } = await authedAgent();
    const res = await agent.get('/api/products').query({ pageSize: 101 });
    expect(res.status).toBe(400);
  });

  it('writes to audited entities create audit_logs rows with userId', async () => {
    const { agent, csrf } = await authedAgent();

    const created = await agent
      .post('/api/products')
      .set('X-CSRF-Token', csrf)
      .send({ name: 'Audited', sku: 'AUD-1', unitPrice: 1 });
    expect(created.status).toBe(201);

    // Pull the audit log via raw SQL — there's no exposed endpoint for it.
    const ds = app.get(DataSource);
    const rows: {
      entityType: string;
      action: string;
      userId: string | null;
    }[] = await ds.query(
      `SELECT "entityType", action, "userId" FROM audit_logs ORDER BY at DESC LIMIT 1`,
    );
    expect(rows[0]).toMatchObject({ entityType: 'products', action: 'insert' });
    expect(rows[0].userId).toBeTruthy();
  });
});

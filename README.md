# Next-Gen Inventory Management (NGIM)

A full-stack inventory management platform.

- **Backend**: NestJS 11 + TypeORM + PostgreSQL
- **Frontend**: Next.js 16 + React 19 + Tailwind CSS 4
- **Infra**: Docker Compose (Postgres, backend, frontend)

## Quick start (Docker)

```bash
cp .env.example .env
# edit .env — at minimum, set DB_PASSWORD and JWT_SECRET
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api
- API docs (Swagger): http://localhost:4000/api/docs

## Local development

### Backend

```bash
cd backend
cp .env.example .env    # then edit values
npm install
npm run start:dev
```

First-run DB schema setup (choose one):

- **Dev convenience**: set `DB_SYNCHRONIZE=true` in `backend/.env` — TypeORM will auto-sync the schema from entities.
- **Production-style**: generate and run a migration:
  ```bash
  npm run migration:generate -- src/migrations/InitialSchema
  npm run migration:run
  ```

Seed demo data:

```bash
npm run seed
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

## Scripts

### Backend

| Script                       | Purpose                               |
| ---------------------------- | ------------------------------------- |
| `npm run start:dev`          | Dev server with watch                 |
| `npm run build`              | Compile to `dist/`                    |
| `npm test`                   | Jest unit tests                       |
| `npm run lint`               | ESLint                                |
| `npm run seed`               | Populate demo data                    |
| `npm run migration:generate` | Generate a migration from entity diff |
| `npm run migration:run`      | Apply pending migrations              |
| `npm run migration:revert`   | Roll back the last migration          |

### Frontend

| Script          | Purpose              |
| --------------- | -------------------- |
| `npm run dev`   | Next.js dev server   |
| `npm run build` | Production build     |
| `npm start`     | Run production build |
| `npm run lint`  | ESLint               |

## Environment variables

See [`./.env.example`](./.env.example), [`backend/.env.example`](./backend/.env.example),
and [`frontend/.env.example`](./frontend/.env.example).

Required backend vars:

- `JWT_SECRET` — the app refuses to boot without this.
- `DB_HOST` / `DB_PORT` / `DB_USERNAME` / `DB_PASSWORD` / `DB_NAME`
- `CORS_ORIGINS` — comma-separated origin allowlist.

## Security notes

- `synchronize` is **off** by default. Use migrations in any shared environment.
- Helmet is applied globally; CORS uses an explicit allowlist.
- Auth endpoints are rate limited (10 req/min/IP).
- Never commit real `.env` files — only `.env.example` is tracked.

## Project structure

```
.
├── backend/      # NestJS API
├── frontend/     # Next.js app
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## License

MIT — see [LICENSE](./LICENSE).

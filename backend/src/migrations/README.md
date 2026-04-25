# Migrations

TypeORM migrations live here. The app no longer uses `synchronize: true` by default —
schema changes must be versioned.

## Generate a migration from current entities

```bash
# With the DB running and reachable using your .env values:
npm run migration:generate -- src/migrations/InitialSchema
```

## Run pending migrations

```bash
npm run migration:run
```

## Revert the last migration

```bash
npm run migration:revert
```

## Opt-in synchronize (local dev only)

If you want TypeORM to auto-sync the schema during local development instead of
writing migrations, set `DB_SYNCHRONIZE=true` in your local `.env`. Never do this
against a production database.

## First-time setup

The initial commit did not include a baseline migration. Before deploying,
generate one against a fresh database so the full schema is captured.

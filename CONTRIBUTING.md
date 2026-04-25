# Contributing to NGIM

Thanks for your interest in improving NGIM!

## Workflow

1. Fork and create a feature branch: `git checkout -b feat/short-description`.
2. Make focused changes — one logical change per PR keeps review fast.
3. Run the checks locally before pushing:
   ```bash
   # backend
   cd backend && npm run lint && npm test && npm run build
   # frontend
   cd ../frontend && npm run lint && npm run build
   ```
4. Open a PR against `main`. CI (see `.github/workflows/ci.yml`) must pass.

## Commit messages

Short imperative subject; explain the _why_ in the body if it isn't obvious
from the diff. Example: `auth: require JWT_SECRET at boot`.

## Database changes

Never enable `synchronize` in shared branches. For any schema change:

```bash
cd backend
npm run migration:generate -- src/migrations/DescribeTheChange
# review the generated SQL, then commit it alongside your entity change
```

## Secrets

Never commit real `.env` files. If you add a new configuration key, update the
corresponding `.env.example` in the same PR.

## Reporting issues

Please include:

- What you expected to happen
- What actually happened (with stack traces / logs if available)
- Steps to reproduce
- Your environment (OS, Node version, browser if relevant)

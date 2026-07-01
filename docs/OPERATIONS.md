# Operations (local + review)

This document is intentionally short: it exists so a reviewer (or future-you) can recover quickly.

## Environment

- Copy `.env.example` to `.env`
- Key vars:
  - `DATABASE_URL`
  - `DEMO_PASSWORD` (required)

## Local reset loop

```bash
npm run db:reset
npm run dev
```

- `db:reset` drops + recreates schema, then seeds demo data.
- `setup` is the one-command local bootstrap: it starts Postgres (Docker), then runs the same destructive reset+reseed flow used elsewhere.

## Docker

```bash
docker compose ps

docker compose logs -f db
```

## Troubleshooting

- If Docker permissions block you, confirm `docker ps` works first.
- If migrations drift, run `npm run db:reset` and retry.

## Repo hygiene

- Generated outputs (`node_modules/`, `.next/`, `dist/`) should never be committed.

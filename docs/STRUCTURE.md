# Repository structure

Purpose: a fast map of this repo for onboarding and “where does X go?”

## Directory map (trimmed)

```text
.
├── README.md                # Main entrypoint (what it is + quickstart + links)
├── LICENSE
├── docker-compose.yml       # Local Postgres (dev)
├── package.json             # Scripts + dependencies
├── next.config.mjs          # Next.js config
├── playwright.config.ts     # Playwright e2e/smoke
├── vitest.config.ts         # Vitest unit tests
├── docs/                    # Docs (architecture, ops, schema, etc)
│   ├── STRUCTURE.md         # Repo map (you are here)
│   ├── ARCHITECTURE.md
│   ├── OPERATIONS.md
│   ├── ROADMAP.md
│   ├── SCHEMA.md
│   ├── TRADEOFFS.md
├── src/                     # Application source (Next.js App Router)
│   ├── app/                 # Routes + server/client components + server actions
│   ├── components/          # Shared UI components
│   ├── lib/                 # Shared utilities/integrations (audit/db)
│   ├── types/               # Shared TS types + ambient defs
│   └── middleware.ts        # Next.js middleware
├── prisma/                  # DB schema/migrations/seed (Prisma)
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
├── tests/                   # Automated tests
│   ├── unit/
│   └── e2e/
├── scripts/                 # Dev/CI helper scripts
│   └── wait-for-db.ts
└── .github/                 # GitHub metadata (CI, automation)
    ├── workflows/
    ├── dependabot.yml
    └── CODEOWNERS
```

## Conventions (what goes where)

- `docs/`: canonical docs; README links here.
- `src/`: all app code; keep root clean.
  - `src/app/`: Next.js App Router routes/layouts + server actions.
  - `src/components/`: reusable UI components (keep route-specific logic in `src/app/`).
  - `src/lib/`: shared utilities/integration code (audit, db helpers).
  - `src/types/`: shared types and ambient declarations.
- `prisma/`: schema + migrations + seed; avoid app logic here.
- `tests/unit/`: fast tests; `tests/e2e/`: Playwright smoke/e2e.
- `scripts/`: helper scripts (idempotent where possible).
- `.github/`: CI + automation.

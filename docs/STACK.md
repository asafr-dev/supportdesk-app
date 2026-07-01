# Stack

Next.js helpdesk app with auth/roles/tickets backed by Postgres (Prisma).

| Area             | Technologies                                               | Evidence                                  |
| ---------------- | ---------------------------------------------------------- | ----------------------------------------- |
| Language/runtime | TypeScript • Node.js 20+                                   | `.nvmrc`, `tsconfig.json`                 |
| Web              | Next.js 15 (App Router) • React 19                         | `package.json`, `src/app/`                |
| Data             | Prisma ORM • PostgreSQL 16                                 | `prisma/`, `docker-compose.yml`           |
| Auth/security    | bcryptjs                                                   | `package.json`                            |
| Validation       | Zod                                                        | `package.json`                            |
| Styling          | Tailwind CSS • PostCSS                                     | `tailwind.config.ts`, `postcss.config.js` |
| Testing          | Vitest (unit) • Playwright (e2e)                           | `package.json`, `playwright.config.ts`    |
| Quality          | ESLint (Next config) • Prettier • TypeScript (`tsc`)       | `eslint.config.mjs`, `package.json`       |
| Local dev        | Docker Compose (Postgres)                                  | `docker-compose.yml`                      |
| Dev env          | VS Code Dev Container / Codespaces                         | `.devcontainer/`                          |
| CI/Security      | GitHub Actions • CodeQL • E2E workflow w/ Postgres service | `.github/workflows/*`                     |
| Deployment       | Railway (Railpack) + migrate/seed on deploy                | `railway.toml`                            |

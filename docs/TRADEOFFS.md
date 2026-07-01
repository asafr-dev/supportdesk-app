# Tradeoffs

These choices are intentional for a small, reviewable demo.

- **Cookie-backed sessions** (DB + httpOnly cookie) keep the app self-contained.
  - A production system often uses a dedicated auth provider + refresh tokens.
- **Route handlers + server actions** fit a single fullstack app.
  - In larger systems you may split the API into a dedicated service (see [`supportdesk-api`](https://github.com/asafr-dev/supportdesk-api) repo).
- **RBAC is intentionally small** (USER/AGENT/ADMIN) to keep the domain reviewable.

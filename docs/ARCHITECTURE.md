# Architecture (SupportDesk App)

This is intentionally simple and review-friendly:

```mermaid
flowchart LR
  Browser --> Next[Next.js App Router]
  Next -->|Server Actions| Actions[Mutations]
  Next -->|Route Handlers| API[REST-style API]
  Actions --> Prisma
  API --> Prisma
  Prisma --> Postgres[(PostgreSQL)]
```

## Key design choices

- **Cookie-backed DB sessions**: very small surface area,
  no external auth dependency for this demo.
- **RBAC**: USER (requester), AGENT (triage), ADMIN (user management).
- **Audit log**: ticket-scoped; ticket lifecycle mutations
  (create, status changes, comments, assignment) write entries.

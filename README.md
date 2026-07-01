<h1 align="center">SupportDesk App</h1>

<p align="center">
  <img src="docs/images/logo.png" width="350" alt="SupportDesk Logo" />
</p>

<p align="center">
  Next.js helpdesk app with auth, roles, and tickets — backed by Postgres via Docker Compose.
</p>

<p align="center">
  <a href="https://codespaces.new/asafr-dev/supportdesk-app?quickstart=1"><img src="https://img.shields.io/badge/Open%20in-GitHub%20Codespaces-3e3e3e?logo=github&style=for-the-badge" alt="Open in GitHub Codespaces"></a>
  <a href="https://github.com/asafr-dev/supportdesk-app/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/asafr-dev/supportdesk-app/ci.yml?branch=main&style=for-the-badge&label=CI" alt="CI"></a>
  <a href="https://github.com/asafr-dev/supportdesk-app/actions/workflows/codeql.yml"><img src="https://img.shields.io/github/actions/workflow/status/asafr-dev/supportdesk-app/codeql.yml?branch=main&style=for-the-badge&label=CODEQL" alt="CodeQL"></a>
  <a href="https://codecov.io/gh/asafr-dev/supportdesk-app"><img alt="Unit Coverage" src="https://img.shields.io/codecov/c/github/asafr-dev/supportdesk-app/main.svg?style=for-the-badge&logo=codecov&label=unit%20coverage&flag=unittests"></a>
  <a href="https://www.codefactor.io/repository/github/asafr-dev/supportdesk-app"><img alt="CodeFactor" src="https://img.shields.io/codefactor/grade/github/asafr-dev/supportdesk-app?branch=main&style=for-the-badge"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/asafr-dev/supportdesk-app?style=for-the-badge" alt="License"></a>
</p>

<p align="center">
  <img src="docs/images/demo.gif" width="600" alt="Demo animation">
</p>

## 🎬 Demo

**Live demo:** [supportdesk-app-demo.up.railway.app](https://supportdesk-app-demo.up.railway.app)

## 🚀 Quickstart

### Requirements

- Linux
- Node 20+
- Docker

### Run locally

```bash
cp .env.example .env
npm ci
npm run setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Run via Codespaces

This repo ships a `.devcontainer` that starts Postgres via docker-compose and forwards port 3000.

In Codespaces:

```bash
cp .env.example .env
npm ci
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) from the Ports tab

## 🧪 How to test

After installing dependencies:

```bash
npm run check
```

## 🗂️ Project structure

For the full directory map and “what goes where” conventions, see
[STRUCTURE.md](docs/STRUCTURE.md).

- `src/app/` – app code (Next.js App Router)
- `src/lib/` – shared utilities/integrations (auth/audit/db)
- `prisma/` – schema + migrations
- `tests/` – unit + Playwright e2e
- `docs/` – longer-form documentation (architecture, ops, tradeoffs, etc)

## 📚 Documentation

See [documentation](docs/)

## 🤝 Contributing

See the [contributing guidelines](https://github.com/asafr-dev/.github/blob/main/CONTRIBUTING.md)

- Future ideas: [ROADMAP.md](docs/ROADMAP.md)

## 🔒 Security

See the [security policy](https://github.com/asafr-dev/.github/blob/main/SECURITY.md)

## 📄 License

See [LICENSE](LICENSE)

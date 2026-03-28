# Contributing to status-page-as-a-service

Thanks for your interest in contributing! This document explains how to get started.

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/status-page-as-a-service.git
   cd status-page-as-a-service
   ```
3. **Create a branch** for your change:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Running Locally

### Prerequisites

- Node.js 20+
- npm

### Development

```bash
npm install
cp .env.example .env   # edit ADMIN_PASSWORD
npm run dev
```

The dev server starts on [http://localhost:3000](http://localhost:3000).

### Docker

```bash
cp .env.example .env   # edit ADMIN_PASSWORD
docker compose up -d
```

The app runs on [http://localhost:3111](http://localhost:3111).

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Public status page (SSR)
│   ├── admin/             # Admin dashboard (protected)
│   └── login/             # Login page
├── actions/               # Server actions (CRUD operations)
├── components/
│   ├── public/            # Public page components
│   ├── admin/             # Admin components (sidebar)
│   └── ui/                # Reusable UI components
├── lib/
│   ├── db/                # Database schema and initialization
│   ├── notifications/     # Email notifications
│   ├── auth.ts            # JWT session management
│   └── utils.ts           # Utilities and constants
└── middleware.ts           # Admin route protection
```

## Code Style

- Use functional components with hooks.
- Follow the existing project structure.
- Use TypeScript strict mode.
- Use Tailwind CSS for styling -- follow existing class patterns.
- Keep server actions in `src/actions/`.
- Keep database schema in `src/lib/db/schema.ts`.

## Submitting a Pull Request

1. Make sure the project builds:
   ```bash
   npm run build
   ```
2. Commit your changes with a clear, descriptive commit message.
3. Push your branch to your fork.
4. Open a Pull Request against the `main` branch.
5. Describe what your PR does and why.

## Reporting Bugs

Open an issue with:
- Steps to reproduce
- Expected vs actual behavior
- Your environment (OS, Docker version, browser)

## Feature Requests

Open an issue describing:
- The use case
- Proposed solution
- Any alternatives you've considered

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

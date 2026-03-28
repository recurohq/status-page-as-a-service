# Architecture Overview

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) | SSR public pages, interactive admin dashboard |
| Language | TypeScript | Type safety across the entire codebase |
| Database | SQLite via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) | Persistent storage, zero-config |
| ORM | [Drizzle ORM](https://orm.drizzle.team/) | Type-safe database queries and schema |
| Styling | [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling with dark mode |
| Email | [nodemailer](https://nodemailer.com/) | SMTP-based subscriber notifications |
| Auth | [jose](https://github.com/panva/jose) | JWT session tokens |
| Deployment | Docker + Docker Compose | Single-command deployment |

## Two Interfaces, One App

The application serves two distinct interfaces from a single Next.js application:

```
PUBLIC STATUS PAGE (no auth, SSR):
  /                    → Service status, uptime bars, incidents, maintenance
  /subscribe           → Email subscription form
  /unsubscribe?token=x → Unsubscribe handler

ADMIN DASHBOARD (password-protected, interactive):
  /admin               → Overview with stats
  /admin/services      → Manage services
  /admin/incidents     → List incidents
  /admin/incidents/new → Create incident
  /admin/incidents/:id → View/update incident
  /admin/maintenance   → Schedule/manage maintenance
  /admin/subscribers   → Manage email subscribers
  /admin/settings      → Site config, timezone, SMTP, import/export

AUTH:
  /login               → Password login
```

**Key architectural choice:** The public status page uses **Next.js Server Components** -- fast first paint, SEO-friendly, works without JavaScript. The admin dashboard uses client components for interactivity.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout (ThemeProvider)
│   ├── (public)/               # Public pages (SSR)
│   │   ├── layout.tsx          # Header + footer
│   │   ├── page.tsx            # Main status page
│   │   ├── subscribe/page.tsx
│   │   └── unsubscribe/page.tsx
│   ├── admin/                  # Admin dashboard
│   │   ├── layout.tsx          # Responsive sidebar + footer
│   │   ├── page.tsx            # Overview stats
│   │   ├── services/page.tsx
│   │   ├── incidents/
│   │   ├── maintenance/page.tsx
│   │   ├── subscribers/page.tsx
│   │   └── settings/page.tsx
│   └── login/page.tsx
├── actions/                    # Server actions
│   ├── auth.ts                 # Login/logout
│   ├── incidents.ts            # Incident CRUD + uptime data
│   ├── maintenance.ts          # Maintenance CRUD
│   ├── services.ts             # Service CRUD
│   ├── settings.ts             # Settings + import/export
│   └── subscribers.ts          # Subscriber management
├── components/
│   ├── public/                 # Public page components
│   │   ├── status-banner.tsx   # Overall status indicator
│   │   ├── service-row.tsx     # Service + uptime chart
│   │   ├── uptime-bars.tsx     # 90-day uptime visualization
│   │   ├── incident-card.tsx   # Incident with update timeline
│   │   └── maintenance-card.tsx
│   ├── admin/
│   │   └── sidebar.tsx         # Navigation sidebar (responsive)
│   ├── ui/                     # Reusable UI primitives
│   ├── theme-provider.tsx      # Dark mode context
│   └── theme-script.tsx        # Flash prevention script
├── lib/
│   ├── db/
│   │   ├── index.ts            # Database initialization (WAL mode)
│   │   └── schema.ts           # Drizzle schema (7 tables)
│   ├── notifications/
│   │   └── email.ts            # SMTP notification delivery
│   ├── auth.ts                 # JWT session management
│   └── utils.ts                # Formatting, constants, types
└── middleware.ts                # Admin route protection
```

## Database Schema

All data is stored in a single SQLite database with 8 tables:

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   services   │     │    incidents     │     │   maintenance    │
├──────────────┤     ├──────────────────┤     ├──────────────────┤
│ id           │     │ id               │     │ id               │
│ name         │     │ title            │     │ title            │
│ description  │     │ status           │     │ description      │
│ status       │◄───┐│ impact           │┌───►│ scheduled_start  │
│ display_order│    ││ started_at       ││    │ scheduled_end    │
│ visible      │    ││ resolved_at      ││    │ status           │
│ created_at   │    ││ created_at       ││    │ created_at       │
└──────────────┘    │└──────────────────┘│    └──────────────────┘
       ▲            │        │           │           ▲
       │            │        ▼           │           │
       │    ┌───────┴────────────┐  ┌────┴───────────┴───┐
       │    │ incident_services  │  │maintenance_services │
       │    ├────────────────────┤  ├────────────────────┤
       └────┤ service_id         │  │ service_id         ├────┘
            │ incident_id        │  │ maintenance_id     │
            └────────────────────┘  └────────────────────┘

┌──────────────────┐     ┌──────────────┐     ┌──────────────┐
│ incident_updates │     │  subscribers │     │   settings   │
├──────────────────┤     ├──────────────┤     ├──────────────┤
│ id               │     │ id           │     │ key (PK)     │
│ incident_id (FK) │     │ email        │     │ value        │
│ status           │     │ verified     │     └──────────────┘
│ message          │     │ token        │
│ created_at       │     │ created_at   │
└──────────────────┘     └──────────────┘
```

- All datetime fields store ISO 8601 strings in UTC
- SQLite runs in WAL mode for concurrent read performance
- Foreign keys are enforced

## Authentication Flow

Single-password authentication using JWT session cookies:

```
User → POST /login (password) → Server validates against ADMIN_PASSWORD env var
  ├─ Success → Set JWT cookie (HTTP-only, 7-day expiry)
  │            → Redirect to /admin
  └─ Failure → Return error message

All /admin/* routes → Middleware checks JWT cookie
  ├─ Valid session → Proceed to page
  └─ Invalid/missing → Redirect to /login
```

There is no user registration, no username, no roles. A single password (from the `ADMIN_PASSWORD` environment variable) protects the entire admin dashboard.

## Data Flow

```
┌──────────┐         ┌───────────────┐         ┌──────────┐
│  Browser  │◄───────►│   Next.js     │◄───────►│  SQLite  │
│           │  HTTP   │   Server      │  Drizzle │  (.db)   │
└──────────┘         └───────┬───────┘         └──────────┘
                             │
                     ┌───────┴───────┐
                     ▼               ▼
               ┌──────────┐   ┌───────────┐
               │  Email   │   │  Settings  │
               │  (SMTP)  │   │  (key/val) │
               └──────────┘   └───────────┘
```

**Public page request:**

1. Browser requests `/`
2. Next.js Server Component fetches services, incidents, maintenance from SQLite
3. Page is rendered server-side and sent as HTML
4. Client hydrates for interactive elements (uptime bar tooltips, theme toggle)

**Admin action (e.g., create incident):**

1. Admin fills form in browser
2. React Server Action sends data to server
3. Server action inserts into SQLite via Drizzle ORM
4. If subscribers exist, email notifications are sent via nodemailer
5. Page revalidates to show updated data

## Notification System

Email notifications are sent for:
- New incident created
- Incident status updated
- Incident resolved
- Maintenance scheduled

Emails are sent to all **verified** subscribers. Each email includes a one-click unsubscribe link with a unique token.

## Timezone Handling

- All dates are stored in the database as **UTC** ISO 8601 strings
- The admin can configure a display timezone via Settings
- `formatDate()` and `formatDateTime()` in `utils.ts` accept an optional timezone parameter
- Server components read the timezone setting from the database
- Client components fetch the timezone setting on mount
- The `Intl.DateTimeFormat` API handles timezone conversion at display time

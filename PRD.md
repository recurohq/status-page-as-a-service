# status-page-as-a-service — Product Requirements Document

> **Version:** 1.0  
> **Date:** March 2026  
> **Status:** Draft

---

A self-hosted public status page with a private admin dashboard.  
Show your users what's up, post incidents, schedule maintenance.  
`docker compose up -d` and you have a status page.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Target Users](#3-target-users)
4. [Competitive Analysis](#4-competitive-analysis)
5. [Product Architecture](#5-product-architecture)
6. [Feature Specifications](#6-feature-specifications)
7. [README & GitHub Repository Specification](#7-readme--github-repository-specification)
8. [SEO & Distribution Strategy](#8-seo--distribution-strategy)
9. [Success Metrics](#9-success-metrics)
10. [Roadmap](#10-roadmap)

---

## 1. Executive Summary

status-page-as-a-service gives you a beautiful public status page (like status.stripe.com) with a private dashboard to manage services, post incidents, and schedule maintenance. Cachet is abandoned. Status-Page is discontinued. Upptime requires GitHub. We're the simple Next.js + SQLite option.

This is a **pure status page** — no built-in monitoring. Pair with `healthcheck-as-a-service` for automated monitoring, or update service statuses manually.

### What We're NOT Building

- No built-in URL monitoring
- No API, no multi-user, no PostgreSQL, no paid tier
- No custom domains in v1.0

---

## 2. Competitive Analysis

| Feature | Cachet | Upptime | OpenStatus | **Ours** |
|---|---|---|---|---|
| Public Page | ✅ | ✅ | ✅ | ✅ |
| Admin Dashboard | ✅ | ❌ (GitHub) | ✅ | ✅ |
| Incidents + Updates | ✅ | ✅ (Issues) | ✅ | ✅ |
| Maintenance Scheduling | ✅ | ❌ | ✅ | ✅ |
| Subscriber Notifications | ❌ | ❌ | ✅ | ✅ |
| 90-Day History Bars | ✅ | ✅ | ✅ | ✅ |
| Dark Mode | ❌ | ❌ | ✅ | ✅ |
| `docker compose up` | ⚠️ | N/A | ⚠️ | ✅ |
| Active | ❌ (abandoned) | ✅ | ✅ | ✅ |
| Stack | PHP+MySQL+Redis | GitHub Actions | Next+Turso+Redis | **Next.js+SQLite** |

---

## 3. Product Architecture

### Tech Stack

| Component | Technology |
|---|---|
| Framework | **Next.js 15** (App Router) |
| Language | **TypeScript** |
| Database | **SQLite** (better-sqlite3) + **Drizzle ORM** |
| Styling | **Tailwind CSS + shadcn/ui** |
| Email | **nodemailer** |
| Deployment | **Docker Compose** |

### Two Interfaces, One App

```
ADMIN DASHBOARD (password-protected):
  /admin/                → Overview
  /admin/services        → Manage services
  /admin/incidents       → Manage incidents
  /admin/incidents/new   → Create incident
  /admin/maintenance     → Schedule maintenance
  /admin/subscribers     → View subscribers
  /admin/settings        → Configuration

PUBLIC STATUS PAGE (no auth, SSR for speed + SEO):
  /                      → Status page
  /subscribe             → Email subscription
  /unsubscribe?token=x   → Unsubscribe
```

**Key architectural choice:** The public status page uses **Next.js Server Components with SSR** — fast loads, SEO-friendly, works without JavaScript. The admin dashboard is interactive React.

### Database Schema

**services** — id, name, description, status (operational/degraded/partial_outage/major_outage/maintenance), display_order, visible, created_at

**incidents** — id, title, status (investigating/identified/monitoring/resolved), impact (none/minor/major/critical), started_at, resolved_at, created_at

**incident_updates** — id, incident_id (FK), status, message (markdown), created_at

**incident_services** — incident_id, service_id (join)

**maintenance** — id, title, description (markdown), scheduled_start, scheduled_end, status (scheduled/in_progress/completed), created_at

**maintenance_services** — maintenance_id, service_id (join)

**subscribers** — id, email (unique), verified, token (unsubscribe), created_at

**settings** — key, value

---

## 4. Feature Specifications

### Admin Dashboard

**F1: Login** — P0. Same pattern.

**F2: Services Management** — P0. List, create, edit, delete, reorder. Quick status dropdown per service.

**F3: Incident Management** — P0. Create: title, impact, affected services, initial status + message (markdown). Post updates: timestamped status change + message. Resolve: sets resolved_at, restores services to operational.

**F4: Maintenance** — P1. Schedule: title, description, services, start/end. Mark in_progress or completed.

**F5: Subscribers** — P1. View list, manual add, export CSV, delete.

**F6: Settings** — P1. Site name, description, logo URL, SMTP config, retention days.

**F7: Import / Export** — P0. Services + incidents as JSON.

**F8: Dark Mode** — P0.

### Public Status Page

**F9: Status Banner** — P0. "All Systems Operational" (green) / "Partial Outage" (yellow) / "Major Outage" (red) based on worst service status.

**F10: Services List** — P0. Name + status badge for each, sorted by display_order.

**F11: 90-Day Uptime Bars** — P0. Per service: 90 thin vertical bars (one per day). Color based on worst incident impact that day. Hover tooltip.

**F12: Active Incidents** — P0. Title, impact badge, affected services, timeline of updates (newest first). Markdown rendered.

**F13: Upcoming Maintenance** — P1. Future/in-progress maintenance with services and schedule.

**F14: Incident History** — P0. Last 14 days of resolved incidents grouped by date.

**F15: Subscribe** — P1. Email input → verification email → confirmed. Unsubscribe via token link.

**F16: Dark Mode (public)** — P0. System preference only (no toggle on public page).

### Notifications
Incident create/update/resolve + maintenance start → email all verified subscribers.

---

## 5. README & SEO

**H1:** `status-page-as-a-service`
**Tagline:** "Self-hosted status page with admin dashboard. `docker compose up -d`."
**Keywords:** `status page as a service`, `self-hosted status page`, `cachet alternative`, `open source status page docker`
**Topics:** `status-page`, `statuspage`, `incident-management`, `self-hosted`, `docker`, `nextjs`, `typescript`

### Repo Structure

```
status-page-as-a-service/
├── src/
│   ├── app/
│   │   ├── (public)/             # Public status page (SSR)
│   │   │   ├── page.tsx          # Status page
│   │   │   ├── subscribe/page.tsx
│   │   │   └── unsubscribe/page.tsx
│   │   ├── admin/                # Admin dashboard (protected)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── services/page.tsx
│   │   │   ├── incidents/page.tsx, new/page.tsx, [id]/page.tsx
│   │   │   ├── maintenance/page.tsx
│   │   │   ├── subscribers/page.tsx
│   │   │   └── settings/page.tsx
│   │   └── login/page.tsx
│   ├── lib/db/ (schema with 7 tables)
│   ├── lib/notifications/
│   ├── components/
│   │   ├── public/ (status-banner, service-row, uptime-bars, incident-card)
│   │   ├── admin/ (service-form, incident-form, maintenance-form)
│   │   ├── ui/
│   ├── actions/ (services, incidents, maintenance, subscribers, settings)
│   ├── middleware.ts (protect /admin/* only)
```

---

## 6–10. Distribution, Metrics, Roadmap

**Launch:** HN, r/selfhosted, dev.to ("Cachet is Dead — Here's a Free Replacement"). 500 stars / 3 months.

### v1.0 (5–6 weeks) — all features above.

### Future
- [ ] Custom domains, RSS/Atom feed, API for programmatic incidents
- [ ] Webhook subscribers, custom branding (colors, logo upload)
- [ ] Integration with healthcheck-as-a-service
- [ ] Embeddable badge / widget

---

## Recuro Funnel

README: "Automate incident detection — pair with [healthcheck-as-a-service](https://github.com/recurohq/healthcheck-as-a-service), or use [Recuro](https://recurohq.com) to schedule health checks."
# status-page-as-a-service

Self-hosted status page with an admin dashboard. SQLite, Docker, nothing else.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

<!-- TODO: screenshots -->

---

## Why

Cachet is abandoned. Upptime requires GitHub Actions. OpenStatus needs Turso + Redis. Statuspage.io costs $29/mo.

This is a status page you can deploy with `docker compose up -d`. No external databases, no Redis, no third-party dependencies. SQLite file in a Docker volume. That's it.

---

## Get running

```bash
git clone https://github.com/recurohq/status-page-as-a-service.git
cd status-page-as-a-service
cp .env.example .env   # set ADMIN_PASSWORD
docker compose up -d
```

Status page: [http://localhost:3111](http://localhost:3111)
Admin: [http://localhost:3111/login](http://localhost:3111/login)

---

## What you get

**Public page** at `/` — server-rendered, works without JS, SEO-friendly:
- Status banner (green/yellow/red based on worst service)
- Per-service 90-day uptime bars with daily granularity
- Active incidents with timestamped update timeline
- Scheduled maintenance with affected services
- 14-day incident history
- Dark mode (follows system preference)
- Email subscribe/unsubscribe

**Admin dashboard** at `/admin` — password-protected:
- Add/edit/reorder services, set status manually
- Create incidents, post Markdown updates, resolve
- Schedule maintenance windows
- Manage email subscribers, export CSV
- Configure timezone (any IANA timezone), site name, SMTP
- Import/export all data as JSON

Everything is mobile-friendly. Admin sidebar collapses to a hamburger on small screens.

---

## Configuration

Set these in `.env` or `docker-compose.yml`:

| Variable | Default | Description |
|---|---|---|
| `ADMIN_PASSWORD` | *(required)* | Admin login password |
| `SITE_NAME` | `Status Page` | Header and page title |
| `SITE_DESCRIPTION` | `Current status of our services` | Meta description |
| `DATABASE_PATH` | `/app/data/status-page.db` | SQLite file location |
| `BASE_URL` | `http://localhost:3000` | Used in email links |
| `SMTP_HOST` | — | For subscriber notifications |
| `SMTP_PORT` | `587` | |
| `SMTP_USER` | — | |
| `SMTP_PASS` | — | |
| `SMTP_FROM` | `status@example.com` | |

Site name, timezone, and SMTP can also be changed from the admin Settings page.

---

## Notifications

If you configure SMTP, subscribers get emailed when:
- An incident is created, updated, or resolved
- Maintenance is scheduled

Users subscribe from the public page, confirm via email, and can unsubscribe with one click. Admins can also add subscribers directly.

---

## Stack

Next.js 15, TypeScript, Tailwind, SQLite (better-sqlite3), Drizzle ORM. Single Docker image, ~100MB.

Architecture details in [docs/architecture.md](docs/architecture.md).

---

## Roadmap

- [ ] REST API
- [ ] RSS/Atom feed
- [ ] Custom branding (colors, logo upload)
- [ ] Embeddable status badge
- [ ] Webhook subscribers
- [ ] Integration with [healthcheck-as-a-service](https://github.com/recurohq/healthcheck-as-a-service)

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)

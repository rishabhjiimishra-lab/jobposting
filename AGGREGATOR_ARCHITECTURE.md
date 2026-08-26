# Automatic Job Aggregator Architecture

## Current Constraint

The existing site is a static GitHub Pages application. Static hosting can serve the frontend, but it cannot safely run scheduled fetchers, persist a database, authenticate admins, or publish verified jobs. The aggregator therefore uses a separate backend deployment and keeps GitHub Pages as the public frontend.

## Target Topology

```text
Official APIs / RSS / permitted public feeds
                |
        Source adapters (worker)
                |
 Fetch -> parse -> normalize -> verify -> categorize -> deduplicate
                |
       PostgreSQL + audit/history tables
                |
     REST API / admin API / scheduled worker
          |                         |
 Public frontend                  Admin dashboard
 GitHub Pages                      Protected backend UI
```

## Services

- `web`: existing static frontend. Reads published jobs from the API and keeps SEO-friendly job detail routes.
- `api`: Node.js TypeScript service. Serves search, filters, job details, source management, health, and admin endpoints.
- `worker`: isolated process for scheduled source runs. A failed source is recorded and does not stop other sources.
- `postgres`: persistent relational store with full-text search and indexes.
- `scheduler`: configurable per-source schedules. Production options: BullMQ/Redis or a managed scheduler calling `POST /admin/sync/:sourceId`.
- `object storage` (optional): stores permitted source snapshots and notification documents, never as a replacement for official links.

## Ingestion Pipeline

1. Load enabled source configurations and due schedules.
2. Fetch with timeout, conditional headers, rate limits, and a descriptive user agent.
3. Parse only permitted API, RSS, JSON-LD, or public HTML feeds.
4. Normalize every field; missing values become `Not specified`.
5. Verify that the source responds and that the application/notification link is present.
6. Categorize using deterministic rules first, then optional review queue for ambiguous records.
7. Deduplicate on notification number, canonical URL, or normalized organization/title/location/deadline fingerprint.
8. Upsert the canonical job and append source references and update history.
9. Publish only `verified` and active records through the public API.
10. Mark deadline-passed records `expired`; retain them in the archive.

## Source Safety Rules

- Prefer official APIs, RSS, JSON feeds, and company career APIs.
- Respect `robots.txt`, terms, rate limits, and cache headers.
- Never bypass CAPTCHAs, authentication, paywalls, bot protection, or access controls.
- Each adapter is isolated; failed parsing is logged to `source_runs` and retried with backoff.
- Human review is required for ambiguous source ownership, missing application links, or conflicting fields.

## Public API

- `GET /api/jobs` supports `q`, repeated `category`, `qualification`, `workMode`, `location`, `organization`, `jobType`, `fresher`, `salaryMin`, `deadlineBefore`, `status`, `page`, and `pageSize`.
- `GET /api/jobs/:slug` returns the canonical verified job and verification timestamp.
- `GET /api/categories` returns available filter facets.
- `GET /api/health` returns API and worker health without secrets.

## Admin API

All admin endpoints require secure session/JWT authentication, CSRF protection where cookie-based, rate limiting, audit logging, and role checks.

- Source CRUD, enable/disable, schedule, retry policy, and test connection.
- Manual `Sync Now` for one source or all due sources.
- Review queue for `needs_review` records.
- Job archive/restore and source-reference inspection.
- Dashboard metrics, run logs, duplicate counts, and failed-source health.

## Deployment

- Keep GitHub Pages for static assets.
- Deploy `api` and `worker` to a server/container platform with HTTPS, environment variables, secret storage, logs, and backups.
- Use PostgreSQL in a managed service and Redis/BullMQ only when queue durability or high source volume requires it.
- Configure `PUBLIC_API_BASE_URL` in the frontend and CORS to the GitHub Pages origin.
- Google Search Console ownership verification and sitemap submission remain an owner action.

## Rollout Plan

1. Database migrations, API contracts, authentication, and health endpoints.
2. Job query/filter/detail API and frontend API integration with static fallback.
3. Source adapter interface plus RSS/JSON adapters and source management.
4. Verification, deduplication, expiry, retry, and audit history.
5. Admin dashboard, review queue, metrics, and notifications.
6. Add official sources one at a time after confirming permission and field mappings.

## Data Quality

The system never invents salary, eligibility, vacancies, dates, or application URLs. Unknown values are stored and rendered as `Not specified`. A record is not labeled `Verified` until its source and official link have been checked by a successful run.

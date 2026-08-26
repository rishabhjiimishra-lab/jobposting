# Aggregator Setup

The frontend remains on GitHub Pages. Supabase runs the database and Edge Functions, while GitHub Actions triggers the worker every six hours.

## 1. Create the database

1. Open Supabase SQL Editor.
2. Run `database-schema.sql`.
3. Run `supabase/migrations/002_public_jobs_policies.sql`.
4. Enable email/password Auth for the admin account.

## 2. Deploy Edge Functions

Install the Supabase CLI, log in locally, link the project, then deploy:

```text
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy jobs --no-verify-jwt
supabase functions deploy sync --no-verify-jwt
```

Set secrets without committing them:

```text
supabase secrets set SYNC_SECRET="GENERATE_A_LONG_RANDOM_VALUE"
```

The sync function also requires the project service-role key in its managed function environment. Never put it in frontend code, Git, or chat.

## 3. Configure GitHub Actions

Add these encrypted repository secrets under Settings > Secrets and variables > Actions:

- `SUPABASE_SYNC_URL`: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/sync`
- `SYNC_SECRET`: the same value configured in Supabase

Run the workflow manually once from the Actions tab. The default schedule is every six hours and can be changed in `.github/workflows/job-sync.yml`.

## 4. Add permitted sources

Insert source rows only for official APIs, RSS feeds, JSON feeds, or public pages that permit automated access. Set `source_type` and `adapter_key` to match the adapter. Start with one source, test it, inspect `source_runs`, then add more.

New records are deliberately stored as `needs_review` and `draft`. They become public only after a real verification/review flow marks them `verified` and `published`. Missing fields remain `Not specified`.

## 5. Current implementation boundary

This repository now contains the database model, RLS policy foundation, public jobs endpoint, generic RSS/JSON sync worker, retry-at-workflow boundary, and scheduled trigger. A production admin UI, richer source-specific adapters, email notifications, and managed deployment still need to be connected to the chosen Supabase project. They cannot be completed or tested against your project until its project ref and permitted source configurations exist.

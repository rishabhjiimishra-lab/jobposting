-- PostgreSQL schema for the automatic job aggregator.
-- Run through a migration tool in production; do not apply manually without backups.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

DO $$ BEGIN CREATE TYPE job_visibility AS ENUM ('draft', 'published', 'archived'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE job_status AS ENUM ('needs_review', 'verified', 'expired', 'source_unavailable'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE source_type AS ENUM ('api', 'rss', 'json', 'public_webpage', 'permitted_feed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE run_status AS ENUM ('running', 'succeeded', 'failed', 'partial'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'private',
  department TEXT,
  website_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  source_url TEXT NOT NULL UNIQUE,
  source_type source_type NOT NULL,
  adapter_key TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  schedule_cron TEXT NOT NULL DEFAULT '0 */6 * * *',
  request_timeout_ms INTEGER NOT NULL DEFAULT 15000,
  max_retries INTEGER NOT NULL DEFAULT 3,
  rate_limit_per_minute INTEGER NOT NULL DEFAULT 30,
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id),
  department TEXT,
  ownership TEXT NOT NULL CHECK (ownership IN ('government', 'private')),
  job_category TEXT NOT NULL,
  job_type TEXT,
  work_mode TEXT,
  location TEXT,
  experience_required TEXT,
  qualification TEXT,
  degree TEXT,
  skills TEXT[] NOT NULL DEFAULT '{}',
  age_limit TEXT,
  salary TEXT,
  vacancies TEXT,
  application_start_date DATE,
  application_last_date DATE,
  exam_date DATE,
  posting_date DATE,
  application_fee TEXT,
  selection_process TEXT,
  description TEXT,
  requirements TEXT,
  notification_url TEXT,
  application_url TEXT NOT NULL,
  canonical_source_url TEXT NOT NULL,
  notification_number TEXT,
  fingerprint TEXT NOT NULL UNIQUE,
  status job_status NOT NULL DEFAULT 'needs_review',
  visibility job_visibility NOT NULL DEFAULT 'draft',
  last_verified_at TIMESTAMPTZ,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  archived_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS job_sources (
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  source_job_key TEXT,
  source_payload JSONB NOT NULL DEFAULT '{}',
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (job_id, source_id)
);

CREATE TABLE IF NOT EXISTS job_categories (
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  PRIMARY KEY (job_id, category)
);

CREATE TABLE IF NOT EXISTS job_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  source_id UUID REFERENCES sources(id),
  change_type TEXT NOT NULL,
  before_data JSONB,
  after_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS verification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  source_id UUID REFERENCES sources(id),
  status job_status NOT NULL,
  checked_url TEXT NOT NULL,
  http_status INTEGER,
  evidence JSONB NOT NULL DEFAULT '{}',
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS source_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  status run_status NOT NULL DEFAULT 'running',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  fetched_count INTEGER NOT NULL DEFAULT 0,
  parsed_count INTEGER NOT NULL DEFAULT 0,
  published_count INTEGER NOT NULL DEFAULT 0,
  duplicate_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  error_message TEXT
);

CREATE TABLE IF NOT EXISTS failed_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_run_id UUID REFERENCES source_runs(id) ON DELETE SET NULL,
  source_id UUID REFERENCES sources(id) ON DELETE SET NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  error_message TEXT NOT NULL,
  retry_count INTEGER NOT NULL DEFAULT 0,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS jobs_active_idx ON jobs (visibility, status, application_last_date);
CREATE INDEX IF NOT EXISTS jobs_filter_idx ON jobs (ownership, job_category, work_mode, location);
CREATE INDEX IF NOT EXISTS jobs_title_trgm_idx ON jobs USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS jobs_org_trgm_idx ON jobs USING gin (canonical_source_url gin_trgm_ops);
CREATE INDEX IF NOT EXISTS jobs_skills_idx ON jobs USING gin (skills);
CREATE INDEX IF NOT EXISTS source_runs_source_started_idx ON source_runs (source_id, started_at DESC);
CREATE INDEX IF NOT EXISTS verification_job_checked_idx ON verification_history (job_id, checked_at DESC);

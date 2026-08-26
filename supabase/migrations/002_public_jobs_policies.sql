-- Public clients may read only published, verified, non-expired jobs.
-- Admin writes must go through authenticated Edge Functions.

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public can read active verified jobs"
  ON jobs FOR SELECT
  USING (visibility = 'published' AND status = 'verified' AND (application_last_date IS NULL OR application_last_date >= CURRENT_DATE));

CREATE POLICY "public can read organizations for active jobs"
  ON organizations FOR SELECT
  USING (EXISTS (SELECT 1 FROM jobs WHERE jobs.organization_id = organizations.id AND jobs.visibility = 'published' AND jobs.status = 'verified'));

CREATE POLICY "public can read published job categories"
  ON job_categories FOR SELECT
  USING (EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_categories.job_id AND jobs.visibility = 'published' AND jobs.status = 'verified'));

CREATE POLICY "public cannot read source payloads"
  ON job_sources FOR SELECT
  USING (false);

CREATE OR REPLACE FUNCTION expire_jobs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  changed_count INTEGER;
BEGIN
  UPDATE jobs
  SET status = 'expired', visibility = 'archived', archived_at = now(), updated_at = now()
  WHERE application_last_date < CURRENT_DATE
    AND status <> 'expired';
  GET DIAGNOSTICS changed_count = ROW_COUNT;
  RETURN changed_count;
END;
$$;

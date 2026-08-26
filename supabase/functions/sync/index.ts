type Source = {
  id: string;
  name: string;
  source_url: string;
  source_type: 'api' | 'rss' | 'json' | 'permitted_feed';
  enabled: boolean;
};

type NormalizedJob = {
  title: string;
  ownership: 'government' | 'private';
  job_category: string;
  application_url: string;
  canonical_source_url: string;
  fingerprint: string;
  status: 'needs_review';
  visibility: 'draft';
  source_id: string;
  source_payload: Record<string, unknown>;
};

const headers = { 'Content-Type': 'application/json' };
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
const supabaseUrl = () => Deno.env.get('SUPABASE_URL')!;
const serviceKey = () => Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const dbHeaders = () => ({ apikey: serviceKey(), Authorization: `Bearer ${serviceKey()}`, ...headers });

const db = async (path: string, options: RequestInit = {}) => fetch(`${supabaseUrl()}/rest/v1/${path}`, { ...options, headers: { ...dbHeaders(), ...(options.headers || {}) } });
const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const fingerprint = (title: string, organization: string, location: string, deadline: string, link: string) => [title, organization, location, deadline, link].map(normalize).join('|');

const inferOwnership = (text: string): 'government' | 'private' => /upsc|ssc|railway|government|govt|psu|defence|police|university/i.test(text) ? 'government' : 'private';
const parseRss = (xml: string, source: Source): NormalizedJob[] => {
  const items = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].map((match) => match[0]);
  return items.map((item) => {
    const read = (tag: string) => item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').trim() || 'Not specified';
    const title = read('title');
    const link = read('link');
    const description = read('description');
    const ownership = inferOwnership(`${title} ${description}`);
    return { title, ownership, job_category: ownership === 'government' ? 'government' : 'private', application_url: link, canonical_source_url: source.source_url, fingerprint: fingerprint(title, source.name, 'Not specified', 'Not specified', link), status: 'needs_review', visibility: 'draft', source_id: source.id, source_payload: { description } };
  }).filter((job) => job.title !== 'Not specified' && /^https?:\/\//i.test(job.application_url));
};

const parseJson = (payload: unknown, source: Source): NormalizedJob[] => {
  const records = Array.isArray(payload) ? payload : (payload as { jobs?: unknown[] })?.jobs || [];
  return records.flatMap((record) => {
    if (!record || typeof record !== 'object') return [];
    const item = record as Record<string, unknown>;
    const title = String(item.title || item.name || 'Not specified');
    const link = String(item.application_url || item.url || item.link || '');
    if (title === 'Not specified' || !/^https?:\/\//i.test(link)) return [];
    const organization = String(item.company || item.organization || source.name);
    const location = String(item.location || 'Not specified');
    const ownership = inferOwnership(`${title} ${organization} ${String(item.category || '')}`);
    return [{ title, ownership, job_category: String(item.category || ownership), application_url: link, canonical_source_url: source.source_url, fingerprint: fingerprint(title, organization, location, String(item.application_last_date || ''), link), status: 'needs_review', visibility: 'draft', source_id: source.id, source_payload: item }];
  });
};

Deno.serve(async (request) => {
  if (request.method !== 'POST') return response({ error: 'POST required' }, 405);
  if (request.headers.get('x-sync-secret') !== Deno.env.get('SYNC_SECRET')) return response({ error: 'Unauthorized' }, 401);
  const requestedSource = (await request.json().catch(() => ({}))).source_id;
  const sourceResponse = await db(`sources?enabled=eq.true${requestedSource ? `&id=eq.${encodeURIComponent(requestedSource)}` : ''}&select=*`);
  if (!sourceResponse.ok) return response({ error: 'Unable to load sources' }, 500);
  const sources = await sourceResponse.json() as Source[];
  const results = [];

  for (const source of sources) {
    const started = new Date().toISOString();
    try {
      if (!['api', 'rss', 'json', 'permitted_feed'].includes(source.source_type)) throw new Error('Source type requires a dedicated permitted adapter');
      const feed = await fetch(source.source_url, { headers: { 'User-Agent': 'RishabhMishraJobAggregator/1.0 (+contact page)' }, signal: AbortSignal.timeout(15000) });
      if (!feed.ok) throw new Error(`Source returned HTTP ${feed.status}`);
      const raw = await feed.text();
      const jobs = source.source_type === 'rss' || raw.trimStart().startsWith('<') ? parseRss(raw, source) : parseJson(JSON.parse(raw), source);
      for (const job of jobs) {
        const jobResponse = await db('jobs?on_conflict=fingerprint', { method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' }, body: JSON.stringify(job) });
        if (!jobResponse.ok) throw new Error(`Job upsert failed with HTTP ${jobResponse.status}`);
      }
      results.push({ source: source.name, status: 'succeeded', count: jobs.length, started });
    } catch (error) {
      results.push({ source: source.name, status: 'failed', error: error instanceof Error ? error.message : 'Unknown source error', started });
    }
  }
  return response({ results });
});

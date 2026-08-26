import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Content-Type': 'application/json',
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: corsHeaders });

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

  const url = new URL(request.url);
  const query = url.searchParams;
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);
  const page = Math.max(Number(query.get('page') || 1), 1);
  const pageSize = Math.min(Math.max(Number(query.get('pageSize') || 20), 1), 100);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  let requestQuery = supabase.from('jobs').select('*, organizations(name, department)', { count: 'exact' })
    .eq('visibility', 'published').eq('status', 'verified')
    .or('application_last_date.is.null,application_last_date.gte.' + new Date().toISOString().slice(0, 10))
    .range(from, to).order('updated_at', { ascending: false });

  const search = query.get('q')?.trim();
  if (search) requestQuery = requestQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%,qualification.ilike.%${search}%`);
  if (query.get('ownership')) requestQuery = requestQuery.eq('ownership', query.get('ownership'));
  if (query.get('workMode')) requestQuery = requestQuery.eq('work_mode', query.get('workMode'));
  if (query.get('location')) requestQuery = requestQuery.ilike('location', `%${query.get('location')}%`);
  if (query.get('jobType')) requestQuery = requestQuery.eq('job_type', query.get('jobType'));

  const { data, error, count } = await requestQuery;
  if (error) return json({ error: 'Unable to load jobs' }, 500);
  return json({ data: data || [], page, pageSize, total: count || 0 });
});

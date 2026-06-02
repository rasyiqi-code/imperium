const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: env not configured');
  process.exit(1);
}

async function run() {
  const url = `${supabaseUrl}/rest/v1/`;
  const headers: Record<string, string> = {
    'apikey': supabaseServiceKey!,
    'Authorization': `Bearer ${supabaseServiceKey!}`
  };
  const res = await fetch(url, { headers });
  const data = await res.json();
  console.log('RPCs:');
  const paths = Object.keys(data.paths);
  for (const path of paths) {
    if (path.startsWith('/rpc/')) {
      console.log(path);
    }
  }
}

run();

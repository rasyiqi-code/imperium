import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: env not configured');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  // We can query postgrest to see functions in the public schema
  const { data } = await supabase.from('admin_settings').select('*');
  console.log('admin_settings columns:');
  if (data && data.length > 0) {
    console.log(Object.keys(data[0]));
  } else {
    console.log('No data in admin_settings');
  }

  const { data: support } = await supabase.from('support_config').select('*');
  console.log('support_config columns:');
  if (support && support.length > 0) {
    console.log(Object.keys(support[0]));
  } else {
    console.log('No data in support_config');
  }
}

run();

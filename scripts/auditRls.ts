import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL as string;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

export async function listPolicies() {
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await supabase.rpc('list_rls_policies');
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

if (require.main === module) {
  listPolicies()
    .then((data) => console.table(data))
    .catch((err) => {
      console.error('Error fetching policies', err.message);
      process.exit(1);
    });
}

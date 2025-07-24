import { listPolicies } from '../scripts/auditRls';

test('throws when env vars are missing', async () => {
  await expect(listPolicies()).rejects.toThrow('Missing SUPABASE_URL');
});

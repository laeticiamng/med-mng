import json
import os
from supabase import create_client

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError('Supabase credentials missing')

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def audit_items(start=1, end=367, output_file='incomplets.json'):
    incomplets = []
    for num in range(start, end + 1):
        item_resp = supabase.table('items_edn').select('id').eq('numero_item', num).execute()
        if not item_resp.data:
            incomplets.append({'numero_item': num, 'reason': 'missing'})
            continue
        item_id = item_resp.data[0]['id']
        comp_resp = supabase.table('competences').select('id').eq('item_id', item_id).eq('rang', 'A').execute()
        if not comp_resp.data:
            incomplets.append({'numero_item': num, 'reason': 'no_rang_a'})
    with open(output_file, 'w') as f:
        json.dump(incomplets, f, indent=2)
    return incomplets


if __name__ == '__main__':
    audit_items()


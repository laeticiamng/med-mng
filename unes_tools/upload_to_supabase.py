import os
from supabase import create_client, Client

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError('Supabase credentials are missing')

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def upsert_item(numero_item: int, titre: str, contenu_html: str) -> int:
    """Insert or update an item. Returns the item id."""
    result = supabase.table('items_edn').upsert(
        {
            'numero_item': numero_item,
            'titre': titre,
            'contenu_html': contenu_html,
        },
        on_conflict='numero_item',
        returning='representation'
    ).execute()
    if result.data:
        return result.data[0]['id']
    raise RuntimeError(f'Item insertion failed: {result}')


def upsert_competence(item_id: int, rang: str, texte: str) -> None:
    supabase.table('competences').upsert(
        {
            'item_id': item_id,
            'rang': rang,
            'texte': texte,
        },
        on_conflict='item_id, rang, texte'
    ).execute()


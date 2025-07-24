import { jsonResponse, errorResponse } from "../response.ts";
import { corsHeaders, securityHeaders, AddToLibraryRequest } from '../types.ts';

export async function handleLibrary(
  req: Request,
  supabase: any,
  path: string,
  url: URL
) {
  // POST /library - Add to library
  if (path === '/library' && req.method === 'POST') {
    const { song_id }: AddToLibraryRequest = await req.json();

    const { error } = await supabase.rpc('med_mng_add_to_library', { song_id });

    if (error) throw error;

    return jsonResponse({ success: true });
  }

  // DELETE /library/:songId - Remove from library
  if (path.startsWith('/library/') && req.method === 'DELETE') {
    const songId = path.split('/')[2];

    const { error } = await supabase.rpc('med_mng_remove_from_library', {
      song_id: songId,
    });

    if (error) throw error;

    return jsonResponse({ success: true });
  }

  // GET /library - Get user library
  if (path === '/library' && req.method === 'GET') {
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(50, parseInt(url.searchParams.get('limit') || '20'));
    const offset = (page - 1) * limit;

    const { data, count, error } = await supabase
      .from('med_mng_view_library')
      .select(
        'id,title,suno_audio_id,meta,created_at,added_to_library_at,is_liked',
        { count: 'exact' }
      )
      .order('added_to_library_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return jsonResponse({ items: data, page, limit, totalCount: count || 0 });
  }

  return null;
}

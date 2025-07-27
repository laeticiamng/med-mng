import { jsonResponse, errorResponse, paginatedResponse } from "../response.ts";
import { corsHeaders, securityHeaders, AddToLibraryRequest, ApiErrorCode } from '../types.ts';
import { log } from '../logger.ts';

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

  // GET /library - Get user library (✅ PAGINATION STANDARDISÉE)
  if (path === '/library' && req.method === 'GET') {
    try {
      const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
      const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));
      const offset = (page - 1) * limit;

      // ✅ Performance: Index sur added_to_library_at + limit serveur
      const { data, count, error } = await supabase
        .from('med_mng_view_library')
        .select(
          'id,title,suno_audio_id,meta,created_at,added_to_library_at,is_liked',
          { count: 'exact' }
        )
        .order('added_to_library_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        log('error', 'Library fetch error', error);
        throw error;
      }

      log('info', `Library retrieved: ${data?.length || 0} items (page ${page})`);

      // ✅ Response paginée standardisée
      return paginatedResponse(data || [], page, limit, count || 0);
    } catch (error) {
      log('error', 'Library endpoint error', error);
      throw error;
    }
  }

  return null;
}

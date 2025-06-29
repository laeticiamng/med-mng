
import { corsHeaders, AddToLibraryRequest } from '../types.ts';

export async function handleLibrary(req: Request, supabase: any, path: string, url: URL) {
  // POST /library - Add to library
  if (path === '/library' && req.method === 'POST') {
    const { song_id }: AddToLibraryRequest = await req.json();
    
    const { error } = await supabase.rpc('med_mng_add_to_library', { song_id });
    
    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // DELETE /library/:songId - Remove from library
  if (path.startsWith('/library/') && req.method === 'DELETE') {
    const songId = path.split('/')[2];
    
    const { error } = await supabase.rpc('med_mng_remove_from_library', { song_id: songId });
    
    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // GET /library - Get user library
  if (path === '/library' && req.method === 'GET') {
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const { data, error } = await supabase
      .from('med_mng_view_library')
      .select('*')
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return null;
}

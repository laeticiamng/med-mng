import { supabase } from '@/integrations/supabase/client';

export const fixCompletedTracks = async () => {
  console.log('🔧 Correction des tracks avec stream_url mais status generating...');

  try {
    // Trouver tous les tracks avec stream_url mais status = generating
    const { data: tracksToFix, error: selectError } = await supabase
      .from('generated_music_tracks')
      .select('*')
      .eq('generation_status', 'generating')
      .not('stream_url', 'is', null);

    if (selectError) {
      console.error('❌ Erreur sélection tracks:', selectError);
      return { error: selectError.message };
    }

    console.log(`🔍 ${tracksToFix?.length || 0} tracks trouvés à corriger`);

    let fixedCount = 0;
    if (tracksToFix && tracksToFix.length > 0) {
      for (const track of tracksToFix) {
        console.log(`🔧 Correction track ${track.id} - task_id: ${track.task_id}`);
        
        const { error: updateError } = await supabase
          .from('generated_music_tracks')
          .update({
            generation_status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', track.id);

        if (updateError) {
          console.error(`❌ Erreur mise à jour track ${track.id}:`, updateError);
        } else {
          console.log(`✅ Track ${track.id} corrigé avec succès`);
          fixedCount++;
        }
      }
    }

    return {
      message: `${fixedCount} tracks corrigés avec succès`,
      tracksFound: tracksToFix?.length || 0,
      tracksFixed: fixedCount
    };

  } catch (error) {
    console.error('❌ Erreur correction tracks:', error);
    return { error: error.message };
  }
};
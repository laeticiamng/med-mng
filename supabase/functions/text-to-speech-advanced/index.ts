// ============================================
// EDGE FUNCTION - TEXT TO SPEECH AVANCÉ POUR MÉDECINE
// ============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TextToSpeechRequest {
  text: string;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  model?: 'tts-1' | 'tts-1-hd';
  speed?: number; // 0.25 to 4.0
  response_format?: 'mp3' | 'opus' | 'aac' | 'flac';
  medical_context?: {
    item_code?: string;
    domain?: string;
    terminology_level?: 'beginner' | 'intermediate' | 'advanced';
  };
  pronunciation_hints?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialiser Supabase pour les logs
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestBody: TextToSpeechRequest = await req.json();
    
    console.log('🔊 Text-to-Speech médical démarré:', {
      textLength: requestBody.text?.length,
      voice: requestBody.voice || 'alloy',
      model: requestBody.model || 'tts-1',
      medicalContext: requestBody.medical_context
    });

    // Validation
    if (!requestBody.text || requestBody.text.trim().length === 0) {
      throw new Error('Le texte à synthétiser est requis');
    }

    if (requestBody.text.length > 4096) {
      throw new Error('Le texte est trop long (maximum 4096 caractères)');
    }

    // Obtenir la clé API OpenAI
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY non configurée');
    }

    // Préparation du texte médical avec hints de prononciation
    let processedText = requestBody.text;
    
    // Appliquer les hints de prononciation si fournis
    if (requestBody.pronunciation_hints && requestBody.pronunciation_hints.length > 0) {
      console.log('📝 Application des hints de prononciation médicale...');
      
      // Remplacer les termes médicaux complexes par leurs versions phonétiques
      requestBody.pronunciation_hints.forEach(hint => {
        const [term, pronunciation] = hint.split(':');
        if (term && pronunciation) {
          const regex = new RegExp(`\\b${term}\\b`, 'gi');
          processedText = processedText.replace(regex, pronunciation);
        }
      });
    }

    // Ajouts contextuels selon le niveau médical
    if (requestBody.medical_context?.terminology_level) {
      switch (requestBody.medical_context.terminology_level) {
        case 'beginner':
          // Ralentir légèrement pour les débutants
          requestBody.speed = Math.min(requestBody.speed || 1.0, 0.9);
          break;
        case 'advanced':
          // Légèrement plus rapide pour les experts
          requestBody.speed = Math.max(requestBody.speed || 1.0, 1.1);
          break;
      }
    }

    console.log('🎯 Envoi à OpenAI TTS:', {
      processedTextLength: processedText.length,
      voice: requestBody.voice || 'alloy',
      speed: requestBody.speed || 1.0,
      model: requestBody.model || 'tts-1'
    });

    // Appel à l'API OpenAI Text-to-Speech
    const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: requestBody.model || 'tts-1',
        input: processedText,
        voice: requestBody.voice || 'alloy',
        response_format: requestBody.response_format || 'mp3',
        speed: Math.max(0.25, Math.min(4.0, requestBody.speed || 1.0))
      }),
    });

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error('❌ Erreur OpenAI TTS:', errorText);
      
      let errorMessage = 'Erreur lors de la génération vocale';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorMessage;
      } catch {
        // Garder le message par défaut si pas de JSON
      }
      
      throw new Error(errorMessage);
    }

    // Obtenir les données audio
    const audioBuffer = await ttsResponse.arrayBuffer();
    const audioSize = audioBuffer.byteLength;
    
    console.log('🎵 Audio généré:', {
      size: `${Math.round(audioSize / 1024)}KB`,
      format: requestBody.response_format || 'mp3',
      duration: 'estimée selon texte'
    });

    // Convertir en base64 pour le retour
    const uint8Array = new Uint8Array(audioBuffer);
    const base64Audio = btoa(
      String.fromCharCode.apply(null, Array.from(uint8Array))
    );

    // Logger l'utilisation (optionnel)
    try {
      await supabaseClient
        .from('tts_usage_logs')
        .insert({
          text_length: processedText.length,
          voice_used: requestBody.voice || 'alloy',
          model_used: requestBody.model || 'tts-1',
          audio_size_kb: Math.round(audioSize / 1024),
          medical_context: requestBody.medical_context,
          created_at: new Date().toISOString()
        });
    } catch (logError) {
      console.warn('⚠️ Impossible de logger l\'utilisation TTS:', logError);
      // Ne pas faire échouer la requête pour un problème de log
    }

    // Retourner l'audio encodé
    return new Response(
      JSON.stringify({
        success: true,
        audio_content: base64Audio,
        audio_size_kb: Math.round(audioSize / 1024),
        format: requestBody.response_format || 'mp3',
        voice_used: requestBody.voice || 'alloy',
        model_used: requestBody.model || 'tts-1',
        text_processed: processedText !== requestBody.text,
        medical_optimizations: {
          pronunciation_hints_applied: requestBody.pronunciation_hints?.length || 0,
          speed_adjusted: requestBody.speed !== 1.0,
          terminology_level: requestBody.medical_context?.terminology_level
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );

  } catch (error) {
    console.error('❌ Erreur Text-to-Speech:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        code: error.name || 'TTS_ERROR'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});

// ============================================
// UTILITAIRES MÉDICAUX POUR TTS
// ============================================

// Dictionnaire de prononciation médicale courante
const MEDICAL_PRONUNCIATION_GUIDE = {
  // Cardiologie
  'tachycardie': 'taki-kar-di',
  'bradycardie': 'bradi-kar-di', 
  'arythmie': 'a-rit-mi',
  'péricarde': 'péri-kard',
  'myocarde': 'mio-kard',
  
  // Neurologie
  'encéphalite': 'en-sé-fa-lit',
  'méningite': 'mé-nin-jit',
  'épilepsie': 'é-pi-lep-si',
  'hémiplégie': 'émi-plé-ji',
  
  // Pneumologie
  'pneumonie': 'pneu-mo-ni',
  'pleurésie': 'pleu-ré-zi',
  'bronchiole': 'bron-ki-ol',
  'alvéoles': 'al-vé-ol',
  
  // Gastroentérologie
  'œsophage': 'é-zo-faj',
  'duodénum': 'duo-dé-nom',
  'cholangite': 'ko-lan-jit',
  
  // Anatomie générale
  'thorax': 'to-raks',
  'abdomen': 'ab-do-mèn',
  'sternum': 'ster-nom',
  'coccyx': 'kok-siks'
};

// Fonction pour appliquer les corrections de prononciation automatiques
function applyMedicalPronunciation(text: string): string {
  let correctedText = text;
  
  Object.entries(MEDICAL_PRONUNCIATION_GUIDE).forEach(([term, pronunciation]) => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    correctedText = correctedText.replace(regex, pronunciation);
  });
  
  return correctedText;
}
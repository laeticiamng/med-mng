import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const EMBEDDING_MODEL = 'text-embedding-3-small';
const CHUNK_SIZE = 1500;
const CHUNK_OVERLAP = 200;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Use service role for write access to embeddings table
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action = 'generate', item_codes = [], batch_size = 10 } = await req.json();

    console.log(`🧬 Generate Embeddings - action: ${action}, items: ${item_codes.length || 'all'}`);

    if (action === 'generate') {
      // Fetch EDN items to embed
      let query = supabase
        .from('edn_items_complete')
        .select('item_code, title, rang_a, rang_b, objectifs_code, specialty');

      if (item_codes.length > 0) {
        query = query.in('item_code', item_codes);
      }

      const { data: items, error: fetchError } = await query.limit(batch_size);

      if (fetchError) {
        throw new Error(`Failed to fetch EDN items: ${fetchError.message}`);
      }

      if (!items || items.length === 0) {
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'No items to process',
          processed: 0 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log(`📚 Processing ${items.length} EDN items`);

      let totalChunks = 0;
      let errors: string[] = [];

      for (const item of items) {
        try {
          // Build content text from item fields
          const contentParts: string[] = [];
          contentParts.push(`Item ${item.item_code}: ${item.title}`);
          
          if (item.specialty) contentParts.push(`Spécialité: ${item.specialty}`);
          if (item.objectifs_code) contentParts.push(`Objectifs: ${item.objectifs_code}`);
          if (item.rang_a) contentParts.push(`Rang A: ${typeof item.rang_a === 'object' ? JSON.stringify(item.rang_a) : item.rang_a}`);
          if (item.rang_b) contentParts.push(`Rang B: ${typeof item.rang_b === 'object' ? JSON.stringify(item.rang_b) : item.rang_b}`);

          const fullContent = contentParts.join('\n\n');
          const chunks = chunkText(fullContent, CHUNK_SIZE, CHUNK_OVERLAP);

          // Generate embeddings for all chunks
          for (let i = 0; i < chunks.length; i++) {
            const embedding = await generateEmbedding(openaiApiKey, chunks[i]);
            
            if (embedding) {
              const { error: upsertError } = await supabase
                .from('edn_embeddings')
                .upsert({
                  item_code: item.item_code,
                  title: item.title,
                  content_chunk: chunks[i],
                  chunk_index: i,
                  embedding: embedding,
                  metadata: {
                    specialty: item.specialty,
                    total_chunks: chunks.length,
                    chunk_size: chunks[i].length
                  }
                }, {
                  onConflict: 'item_code,chunk_index'
                });

              if (upsertError) {
                errors.push(`${item.item_code}[${i}]: ${upsertError.message}`);
              } else {
                totalChunks++;
              }
            }
          }

          // Rate limit: small delay between items
          await new Promise(resolve => setTimeout(resolve, 200));
          
        } catch (itemError) {
          errors.push(`${item.item_code}: ${itemError.message}`);
        }
      }

      console.log(`✅ Embedded ${totalChunks} chunks from ${items.length} items`);

      return new Response(JSON.stringify({
        success: true,
        processed_items: items.length,
        total_chunks: totalChunks,
        errors: errors.length > 0 ? errors : undefined
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (action === 'stats') {
      const { count, error } = await supabase
        .from('edn_embeddings')
        .select('*', { count: 'exact', head: true });

      const { data: uniqueItems } = await supabase
        .from('edn_embeddings')
        .select('item_code')
        .limit(1000);

      const uniqueCount = new Set(uniqueItems?.map(i => i.item_code)).size;

      return new Response(JSON.stringify({
        success: true,
        total_chunks: count || 0,
        unique_items: uniqueCount,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Generate embeddings error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Embedding generation failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function generateEmbedding(apiKey: string, text: string): Promise<number[] | null> {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: text.slice(0, 8000) // OpenAI limit
      })
    });

    if (!response.ok) {
      console.error(`Embedding API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Embedding generation failed:', error);
    return null;
  }
}

function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  if (text.length <= chunkSize) return [text];
  
  const chunks: string[] = [];
  let start = 0;
  
  while (start < text.length) {
    let end = start + chunkSize;
    
    // Try to break at sentence boundary
    if (end < text.length) {
      const lastPeriod = text.lastIndexOf('.', end);
      const lastNewline = text.lastIndexOf('\n', end);
      const breakPoint = Math.max(lastPeriod, lastNewline);
      if (breakPoint > start + chunkSize / 2) {
        end = breakPoint + 1;
      }
    }
    
    chunks.push(text.slice(start, end).trim());
    start = end - overlap;
  }
  
  return chunks.filter(c => c.length > 50);
}

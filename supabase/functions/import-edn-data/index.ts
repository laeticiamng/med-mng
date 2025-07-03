import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ImportRequest {
  batchId: string;
  csvData?: string;
  fileUrl?: string;
  mappingConfig: Record<string, string>;
}

interface EdnItemData {
  item_code: string;
  title: string;
  subtitle?: string;
  slug: string;
  tableau_rang_a?: any;
  tableau_rang_b?: any;
  paroles_musicales?: string[];
  scene_immersive?: any;
  quiz_questions?: any;
  pitch_intro?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Unauthorized");

    const { batchId, csvData, fileUrl, mappingConfig }: ImportRequest = await req.json();

    // Récupérer les informations du batch
    const { data: batch, error: batchError } = await supabaseClient
      .from("import_batches")
      .select("*")
      .eq("id", batchId)
      .eq("user_id", userData.user.id)
      .single();

    if (batchError || !batch) throw new Error("Batch not found");

    // Mettre à jour le statut à "processing"
    await supabaseClient
      .from("import_batches")
      .update({ status: "processing" })
      .eq("id", batchId);

    let rawCsvData = csvData;
    
    // Si c'est un fichier, le télécharger
    if (fileUrl && !csvData) {
      const fileResponse = await fetch(fileUrl);
      rawCsvData = await fileResponse.text();
    }

    if (!rawCsvData) throw new Error("No data to process");

    // Parser le CSV
    const lines = rawCsvData.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const dataRows = lines.slice(1);

    console.log(`Processing ${dataRows.length} rows with headers:`, headers);

    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;
    const errors: any[] = [];

    // Traiter chaque ligne
    for (let i = 0; i < dataRows.length; i++) {
      try {
        const row = dataRows[i];
        if (!row.trim()) continue;

        const values = parseCSVRow(row);
        const rowData: Record<string, string> = {};
        
        headers.forEach((header, index) => {
          rowData[header] = values[index] || '';
        });

        // Stocker les données brutes
        await supabaseClient
          .from("import_raw_data")
          .insert({
            batch_id: batchId,
            row_number: i + 2, // +2 because we skip header and arrays are 0-indexed
            raw_data: rowData
          });

        // Mapper les données selon la configuration
        const mappedData = mapRowData(rowData, mappingConfig);
        
        // Valider les données
        const validationResult = validateEdnItemData(mappedData);
        if (!validationResult.isValid) {
          throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
        }

        // Créer le slug automatiquement si pas fourni
        if (!mappedData.slug && mappedData.title) {
          mappedData.slug = generateSlug(mappedData.title);
        }

        // Insérer dans edn_items_immersive
        const { error: insertError } = await supabaseClient
          .from("edn_items_immersive")
          .insert({
            item_code: mappedData.item_code,
            title: mappedData.title,
            subtitle: mappedData.subtitle || null,
            slug: mappedData.slug,
            tableau_rang_a: mappedData.tableau_rang_a ? JSON.parse(mappedData.tableau_rang_a) : null,
            tableau_rang_b: mappedData.tableau_rang_b ? JSON.parse(mappedData.tableau_rang_b) : null,
            paroles_musicales: mappedData.paroles_musicales ? mappedData.paroles_musicales.split('|') : null,
            scene_immersive: mappedData.scene_immersive ? JSON.parse(mappedData.scene_immersive) : null,
            quiz_questions: mappedData.quiz_questions ? JSON.parse(mappedData.quiz_questions) : null,
            pitch_intro: mappedData.pitch_intro || null
          });

        if (insertError) {
          throw new Error(`Database insert failed: ${insertError.message}`);
        }

        successCount++;
        
        // Marquer comme traité
        await supabaseClient
          .from("import_raw_data")
          .update({ processed: true })
          .eq("batch_id", batchId)
          .eq("row_number", i + 2);

      } catch (error) {
        console.error(`Error processing row ${i + 2}:`, error);
        errorCount++;
        errors.push({
          row: i + 2,
          error: error.message
        });

        // Marquer comme erreur
        await supabaseClient
          .from("import_raw_data")
          .update({ 
            processed: true, 
            error_message: error.message 
          })
          .eq("batch_id", batchId)
          .eq("row_number", i + 2);
      }

      processedCount++;

      // Mettre à jour le progrès
      await supabaseClient
        .from("import_batches")
        .update({
          processed_rows: processedCount,
          success_rows: successCount,
          error_rows: errorCount,
          errors: errors
        })
        .eq("id", batchId);
    }

    // Finaliser le batch
    await supabaseClient
      .from("import_batches")
      .update({
        status: errorCount === 0 ? "completed" : "completed",
        completed_at: new Date().toISOString(),
        total_rows: dataRows.length
      })
      .eq("id", batchId);

    return new Response(JSON.stringify({
      success: true,
      processed: processedCount,
      success: successCount,
      errors: errorCount,
      errorDetails: errors
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Import error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function parseCSVRow(row: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

function mapRowData(rowData: Record<string, string>, mappingConfig: Record<string, string>): any {
  const mapped: any = {};
  
  for (const [csvColumn, dbField] of Object.entries(mappingConfig)) {
    if (rowData[csvColumn] !== undefined) {
      mapped[dbField] = rowData[csvColumn];
    }
  }
  
  return mapped;
}

function validateEdnItemData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.item_code) errors.push("item_code is required");
  if (!data.title) errors.push("title is required");
  
  // Valider que les JSONs sont valides si fournis
  const jsonFields = ['tableau_rang_a', 'tableau_rang_b', 'scene_immersive', 'quiz_questions'];
  
  for (const field of jsonFields) {
    if (data[field]) {
      try {
        JSON.parse(data[field]);
      } catch {
        errors.push(`${field} must be valid JSON`);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, '')    // Remove special chars
    .trim()
    .replace(/\s+/g, '-')            // Replace spaces with hyphens
    .replace(/-+/g, '-');            // Remove duplicate hyphens
}
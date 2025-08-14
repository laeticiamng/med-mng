import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🔍 ANALYSE COMPLÉTION DES COMPÉTENCES OIC')
    console.log('=====================================')

    const { data: competencesAll, error: queryError } = await supabase
      .from('backup_oic_competences')
      .select('objectif_id, intitule, description, item_parent, rang, url_source')

    if (queryError) {
      throw queryError
    }

    const competencesIncompletes = (competencesAll || []).filter((comp: any) => {
      const desc = typeof comp.description === 'string' ? comp.description : ''
      // Retirer la limite de 30 caractères - toute description manquante ou contenant du contenu générique LiSA
      if (!desc || desc.trim().length === 0) return true
      
      // Détecter le contenu générique LiSA (page d'accueil)
      const genericLiSAContent = desc.toLowerCase().includes('bienvenue sur lisa edn 2025') ||
                                 desc.toLowerCase().includes('items de connaissances') ||
                                 desc.toLowerCase().includes('la conférence des doyens a retenu')
      
      return genericLiSAContent
    })

    if (queryError) {
      throw queryError
    }

    console.log(`📊 Compétences incomplètes trouvées: ${competencesIncompletes.length}`)

    // 2. Complétion via url_source (avec cookie UNESS)
    console.log('\n🌐 COMPLÉTION VIA url_source (session UNESS) ...')

    const cookieEnvNames = [
      'UNESS_SESSION_COOKIE',
      'UNESS_COOKIE',
      'LISA_SESSION_COOKIE',
      'UNES_SESSION_COOKIE',
      'CAS_UNESS_COOKIE',
      'PHPSESSID'
    ] as const

    const rawCookie = cookieEnvNames
      .map((k) => (Deno.env.get(k) || '').trim())
      .find((v) => !!v) || ''

    if (!rawCookie) {
      console.warn('⚠️ Aucun cookie de session UNESS trouvé parmi: ' + cookieEnvNames.join(', '))
    }

    const buildCookieHeader = (cookie: string) => {
      if (!cookie) return undefined
      // Si l'utilisateur a collé un cookie complet ("SESS=...; other=..."), on le passe tel quel
      if (cookie.includes('=')) return cookie
      // Sinon, on suppose que c'est une valeur de PHPSESSID
      return `PHPSESSID=${cookie}`
    }

    const cookieHeader = buildCookieHeader(rawCookie)

    const extractDescription = (html: string): string | null => {
      try {
        // Chercher la ligne <th> Description ... puis le <td> suivant
        const regex = /<th[^>]*>\s*Description\s*<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>/i
        const m = html.match(regex)
        if (!m) return null
        let inner = m[1]
        // Convertir <br> en sauts de ligne
        inner = inner.replace(/<br\s*\/?\s*>/gi, '\n')
        // Supprimer les balises HTML restantes
        inner = inner.replace(/<[^>]+>/g, '')
        // Normaliser l'espace
        inner = inner.replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim()
        return inner || null
      } catch (_) {
        return null
      }
    }

    let processed = 0
    let updated = 0
    let errors = 0

    const incompletesWithUrl = (competencesIncompletes || []).filter((c: any) => !!c.url_source)
    console.log(`🎯 Cibles à compléter (avec URL): ${incompletesWithUrl.length}`)

    for (const comp of incompletesWithUrl) {
      processed++
      const objectifId = comp.objectif_id
      const url = comp.url_source
      try {
        const res = await fetch(url, {
          headers: cookieHeader ? { Cookie: cookieHeader, 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'fr-FR,fr;q=0.9' } : { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'fr-FR,fr;q=0.9' },
        })
        const html = await res.text()

        // Détection basique de redirection vers login
        if (res.status >= 300 && res.status < 400 || /<title>.*(Connexion|Login).*<\/title>/i.test(html)) {
          console.warn(`⚠️ ${objectifId}: page semble protégée (status ${res.status}), cookie requis`)
        }

        const description = extractDescription(html)
        if (!description) {
          console.log(`ℹ️ ${objectifId}: description introuvable`)
          continue
        }
        
        // Vérifier que ce n'est pas du contenu générique LiSA
        const isGenericLiSA = description.toLowerCase().includes('bienvenue sur lisa edn 2025') ||
                              description.toLowerCase().includes('items de connaissances') ||
                              description.toLowerCase().includes('la conférence des doyens a retenu')
        
        if (isGenericLiSA) {
          console.log(`ℹ️ ${objectifId}: contenu générique LiSA détecté, ignoré`)
          continue
        }

        const { error: updateError } = await supabase
          .from('backup_oic_competences')
          .update({ description, updated_at: new Date().toISOString(), extraction_status: 'completed' })
          .eq('objectif_id', objectifId)

        if (updateError) {
          console.error(`❌ Erreur mise à jour ${objectifId}:`, updateError)
          errors++
        } else {
          updated++
          console.log(`✅ ${objectifId} mis à jour (${description.substring(0, 80)}${description.length > 80 ? '…' : ''})`)
        }

        // throttle léger pour éviter d'ennuyer LiSA
        await new Promise(r => setTimeout(r, 200))
      } catch (e) {
        console.error(`❌ ${objectifId}: échec récupération`, e)
        errors++
      }
    }


    // 7. Statistiques finales
    const totalTargets = incompletesWithUrl.length
    const base = competencesIncompletes.length || 1
    const finalStats = {
      success: true,
      statistics: {
        competences_incompletes_detectees: competencesIncompletes.length,
        cibles_avec_url: totalTargets,
        competences_processed: processed,
        competences_updated: updated,
        errors: errors,
        completion_rate: Math.round((updated / base) * 100)
      },
      timestamp: new Date().toISOString()
    }

    console.log('\n🎉 COMPLÉTION TERMINÉE!')
    console.log(`📊 Statistiques:`)
    console.log(`   - Compétences incomplètes détectées: ${competencesIncompletes.length}`)
    console.log(`   - Cibles avec URL: ${totalTargets}`)
    console.log(`   - Pages traitées: ${processed}`)
    console.log(`   - Compétences mises à jour: ${updated}`)
    console.log(`   - Erreurs: ${errors}`)
    console.log(`   - Taux de complétion: ${finalStats.statistics.completion_rate}%`)


    return new Response(JSON.stringify(finalStats), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('❌ Erreur générale:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
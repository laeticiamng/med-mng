import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../../_shared/cors.ts'

import { getErrorMessage } from '../../_shared/error-utils.ts';
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ SÉCURITÉ CRITIQUE: Authentification requise pour debug-oic-extraction
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Créer client Supabase si nécessaire
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.50.3');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Vérifier le token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // ✅ SÉCURITÉ: Vérifier rôle ADMIN pour debug-oic-extraction
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = userRoles?.some((r) => r.role === 'admin');
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ success: false, error: 'Admin role required' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`✅ debug-oic-extraction autorisé pour admin ${user.id}`);

    // Code original de la fonction
    
    const { step = 'all' } = await req.json()
    console.log(`🔧 DEBUG OIC EXTRACTION - Étape: ${step}`)
    
    const results = []
    
    // ÉTAPE 1: Vérifier si l'API est publique
    if (step === 'all' || step === '1') {
      console.log('📡 ÉTAPE 1: Test accès API publique...')
      results.push('=== ÉTAPE 1: TEST API PUBLIQUE ===')
      
      try {
        const testResponse = await fetch('https://livret.uness.fr/lisa/2025/api.php?action=query&meta=siteinfo&format=json&origin=*', {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; OIC-Debug/1.0)',
            'Accept': 'application/json'
          }
        })
        
        results.push(`Status: ${testResponse.status} ${testResponse.statusText}`)
        results.push(`Headers: ${JSON.stringify(Object.fromEntries(testResponse.headers))}`)
        
        if (testResponse.ok) {
          const data = await testResponse.text()
          results.push(`Contenu (200 premiers chars): ${data.substring(0, 200)}`)
          results.push('✅ API accessible publiquement')
        } else if (testResponse.status === 302) {
          results.push('🔐 Redirection CAS détectée - API protégée')
        } else if (testResponse.status === 403) {
          results.push('🚫 Accès interdit - API protégée')
        }
      } catch (error: unknown) {
        results.push(`❌ Erreur test API: ${getErrorMessage(error)}`)
      }
    }
    
    // ÉTAPE 2: Test requête catégorie minimale
    if (step === 'all' || step === '2') {
      console.log('📋 ÉTAPE 2: Test requête catégorie...')
      results.push('=== ÉTAPE 2: TEST REQUÊTE CATÉGORIE ===')
      
      try {
        const url = new URL('https://livret.uness.fr/lisa/2025/api.php')
        url.searchParams.set('action', 'query')
        url.searchParams.set('list', 'categorymembers')
        url.searchParams.set('cmtitle', 'Catégorie:Objectif_de_connaissance')
        url.searchParams.set('cmlimit', '3')
        url.searchParams.set('format', 'json')
        url.searchParams.set('origin', '*')
        
        results.push(`URL testée: ${url.toString()}`)
        
        const response = await fetch(url.toString(), {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; OIC-Debug/1.0)',
            'Accept': 'application/json'
          }
        })
        
        results.push(`Status: ${response.status}`)
        
        if (response.ok) {
          const data = await response.json()
          results.push(`Réponse JSON: ${JSON.stringify(data, null, 2)}`)
          
          if (data.query?.categorymembers?.length > 0) {
            results.push(`✅ ${data.query.categorymembers.length} membres trouvés dans la catégorie`)
            results.push('Premiers titres:')
            data.query.categorymembers.slice(0, 3).forEach((member: any, i: number) => {
              results.push(`  ${i+1}. ${member.title} (ID: ${member.pageid})`)
            })
          } else {
            results.push('❌ Aucun membre trouvé dans la catégorie')
            results.push('DIAGNOSTIC: Titre de catégorie incorrect ou API inaccessible')
          }
        } else {
          const errorText = await response.text()
          results.push(`Erreur: ${errorText.substring(0, 500)}`)
        }
      } catch (error: unknown) {
        results.push(`❌ Erreur test catégorie: ${getErrorMessage(error)}`)
      }
    }
    
    // ÉTAPE 3: Test avec différents noms de catégorie
    if (step === 'all' || step === '3') {
      console.log('🔍 ÉTAPE 3: Test variantes nom catégorie...')
      results.push('=== ÉTAPE 3: TEST VARIANTES CATÉGORIE ===')
      
      const variants = [
        'Catégorie:Objectif_de_connaissance',
        'Category:Objectif_de_connaissance',
        'Catégorie:Objectif de connaissance',
        'Catégorie:Objectifs_de_connaissance',
        'Catégorie:OIC',
        'Category:OIC'
      ]
      
      for (const variant of variants) {
        try {
          const url = new URL('https://livret.uness.fr/lisa/2025/api.php')
          url.searchParams.set('action', 'query')
          url.searchParams.set('list', 'categorymembers')
          url.searchParams.set('cmtitle', variant)
          url.searchParams.set('cmlimit', '1')
          url.searchParams.set('format', 'json')
          url.searchParams.set('origin', '*')
          
          const response = await fetch(url.toString(), {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; OIC-Debug/1.0)',
              'Accept': 'application/json'
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            const count = data.query?.categorymembers?.length || 0
            results.push(`"${variant}": ${count} membres`)
            if (count > 0) {
              results.push(`  ✅ TROUVÉ! Premier: ${data.query.categorymembers[0].title}`)
            }
          } else {
            results.push(`"${variant}": Erreur ${response.status}`)
          }
        } catch (error: unknown) {
          results.push(`"${variant}": Exception ${getErrorMessage(error)}`)
        }
      }
    }
    
    // ÉTAPE 4: Test récupération contenu page
    if (step === 'all' || step === '4') {
      console.log('📄 ÉTAPE 4: Test récupération contenu...')
      results.push('=== ÉTAPE 4: TEST CONTENU PAGE ===')
      
      try {
        // D'abord récupérer quelques IDs
        const listUrl = new URL('https://livret.uness.fr/lisa/2025/api.php')
        listUrl.searchParams.set('action', 'query')
        listUrl.searchParams.set('list', 'categorymembers')
        listUrl.searchParams.set('cmtitle', 'Catégorie:Objectif_de_connaissance')
        listUrl.searchParams.set('cmlimit', '5')
        listUrl.searchParams.set('format', 'json')
        listUrl.searchParams.set('origin', '*')
        
        const listResponse = await fetch(listUrl.toString())
        if (listResponse.ok) {
          const listData = await listResponse.json()
          const members = listData.query?.categorymembers || []
          
          if (members.length > 0) {
            const firstId = members[0].pageid
            results.push(`Test contenu page ID: ${firstId}`)
            
            // Récupérer le contenu
            const contentUrl = new URL('https://livret.uness.fr/lisa/2025/api.php')
            contentUrl.searchParams.set('action', 'query')
            contentUrl.searchParams.set('prop', 'revisions')
            contentUrl.searchParams.set('rvprop', 'content')
            contentUrl.searchParams.set('pageids', firstId.toString())
            contentUrl.searchParams.set('format', 'json')
            contentUrl.searchParams.set('formatversion', '2')
            contentUrl.searchParams.set('origin', '*')
            
            const contentResponse = await fetch(contentUrl.toString())
            if (contentResponse.ok) {
              const contentData = await contentResponse.json()
              results.push(`Contenu récupéré: ${JSON.stringify(contentData).substring(0, 300)}...`)
              
              if (contentData.query?.pages?.[0]?.revisions?.[0]?.content) {
                results.push('✅ Contenu page accessible')
              } else {
                results.push('❌ Contenu page vide')
              }
            }
          }
        }
      } catch (error: unknown) {
        results.push(`❌ Erreur test contenu: ${getErrorMessage(error)}`)
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        results: results
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error: unknown) {
    console.error('❌ Erreur debug OIC:', error)
    return new Response(
      JSON.stringify({ 
        error: getErrorMessage(error),
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
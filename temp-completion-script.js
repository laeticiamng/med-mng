// Script de lancement pour compléter les compétences OIC
const supabaseUrl = "https://yaincoxihiqdksxgrsrk.supabase.co"

async function runCompletion() {
  console.log('🚀 Démarrage de la complétion des compétences OIC...')
  
  try {
    // 1. Vérifier d'abord les compétences incomplètes
    console.log('🔍 Étape 1: Vérification des compétences incomplètes...')
    
    const checkResponse = await fetch(`${supabaseUrl}/functions/v1/complete-oic-competences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action: 'check_incomplete' })
    })
    
    if (!checkResponse.ok) {
      throw new Error(`Erreur HTTP: ${checkResponse.status}`)
    }
    
    const checkData = await checkResponse.json()
    console.log(`📊 Rapport d'analyse:`)
    console.log(`   - Total compétences: ${checkData.total_competences}`)
    console.log(`   - Compétences incomplètes: ${checkData.total_incompletes}`)
    console.log(`   - Pourcentage incomplet: ${checkData.pourcentage_incomplet}%`)
    console.log(`   - Items affectés: ${checkData.par_item.length}`)
    
    if (checkData.total_incompletes === 0) {
      console.log('✅ Toutes les compétences sont déjà complètes!')
      return
    }
    
    // 2. Lancer la complétion
    console.log('\n🔄 Étape 2: Lancement de la complétion...')
    
    const completeResponse = await fetch(`${supabaseUrl}/functions/v1/complete-oic-competences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action: 'complete_all' })
    })
    
    if (!completeResponse.ok) {
      throw new Error(`Erreur HTTP: ${completeResponse.status}`)
    }
    
    const completeData = await completeResponse.json()
    console.log(`✅ Complétion démarrée:`)
    console.log(`   - Session ID: ${completeData.session_id}`)
    console.log(`   - Message: ${completeData.message}`)
    
    console.log('\n🎉 Processus de complétion lancé en arrière-plan!')
    console.log('📊 Vous pouvez suivre les logs dans la console Supabase')
    
  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }
}

// Lancer immédiatement
runCompletion()
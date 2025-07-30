// Script pour lancer la complétion des compétences OIC
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = "https://yaincoxihiqdksxgrsrk.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU"

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  console.log('🚀 Lancement de la complétion des compétences OIC...')
  
  try {
    // 1. Vérifier d'abord les compétences incomplètes
    console.log('🔍 Étape 1: Vérification des compétences incomplètes...')
    const checkResponse = await supabase.functions.invoke('complete-oic-competences', {
      body: { action: 'check_incomplete' }
    })
    
    if (checkResponse.error) {
      throw new Error(`Erreur vérification: ${checkResponse.error.message}`)
    }
    
    const checkData = checkResponse.data
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
    const completeResponse = await supabase.functions.invoke('complete-oic-competences', {
      body: { action: 'complete_all' }
    })
    
    if (completeResponse.error) {
      throw new Error(`Erreur complétion: ${completeResponse.error.message}`)
    }
    
    const completeData = completeResponse.data
    console.log(`✅ Complétion démarrée:`)
    console.log(`   - Session ID: ${completeData.session_id}`)
    console.log(`   - Message: ${completeData.message}`)
    
    // 3. Suivre le statut
    console.log('\n📊 Étape 3: Suivi du statut...')
    await new Promise(resolve => setTimeout(resolve, 5000)) // Attendre 5 secondes
    
    const statusResponse = await supabase.functions.invoke('complete-oic-competences', {
      body: { action: 'status' }
    })
    
    if (statusResponse.data) {
      const statusData = statusResponse.data
      console.log(`📈 Statut final:`)
      console.log(`   - Total compétences: ${statusData.total_competences}`)
      console.log(`   - Compétences incomplètes restantes: ${statusData.competences_incompletes}`)
      console.log(`   - Taux de complétion: ${statusData.taux_completion}`)
      console.log(`   - Statut: ${statusData.status}`)
    }
    
    console.log('\n🎉 Processus de complétion terminé!')
    
  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }
}

// Lancer le script
if (import.meta.main) {
  main()
}
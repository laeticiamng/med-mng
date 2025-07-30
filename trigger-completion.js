// Appel direct à la fonction de complétion
fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/complete-oic-competences', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ action: 'complete_all' })
})
.then(response => response.json())
.then(data => {
  console.log('✅ Complétion démarrée:', data)
})
.catch(error => {
  console.error('❌ Erreur:', error)
})
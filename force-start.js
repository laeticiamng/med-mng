// 🚨 FORCE START - Démarrage forcé sans délai
fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/auto-extract-oic', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
  },
  body: JSON.stringify({ force_immediate: true })
})
.then(r => r.json())
.then(data => console.log('🚀 FORCE START:', data))
.catch(e => console.error('💥 ERREUR:', e));

// Backup: extraction directe
setTimeout(() => {
  fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/extract-edn-objectifs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
    },
    body: JSON.stringify({ action: 'start' })
  })
  .then(r => r.json())
  .then(data => console.log('🎯 BACKUP START:', data));
}, 2000);
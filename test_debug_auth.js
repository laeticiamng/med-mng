// Test direct de la fonction debug-uness-auth
const testDebugAuth = async () => {
  try {
    const response = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/debug-uness-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
      },
      body: JSON.stringify({ name: "Functions" })
    });
    
    const result = await response.json();
    console.log('Status:', response.status);
    console.log('Result:', JSON.stringify(result, null, 2));
    
    if (result.debug) {
      result.debug.forEach((step, i) => {
        console.log(`Step ${step.step || i+1}:`, step);
      });
    }
  } catch (error) {
    console.error('Erreur test:', error);
  }
};

testDebugAuth();
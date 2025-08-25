import React from 'react';

const App = () => {
  console.log('🔥 Ultra minimal App rendering...');
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#1a1a2e',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>MED-MNG</h1>
        <p style={{ fontSize: '1.2rem', color: '#ccc' }}>Ultra minimal test</p>
        <p style={{ fontSize: '1rem', color: '#999', marginTop: '2rem' }}>
          If you see this, React is working properly
        </p>
      </div>
    </div>
  );
};

export default App;
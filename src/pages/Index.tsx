import React from 'react';

const Index = () => {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f0f0', 
      minHeight: '100vh',
      fontSize: '18px',
      color: '#333'
    }}>
      <h1 style={{ color: 'red', fontSize: '32px' }}>TEST - PAGE SIMPLE</h1>
      <p>Si vous voyez ce texte, l'application fonctionne.</p>
      <p>Problème : Les composants complexes causent l'erreur.</p>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        margin: '20px 0',
        border: '2px solid #333',
        borderRadius: '10px'
      }}>
        <h2>MED MNG - Test Simple</h2>
        <button 
          style={{ 
            backgroundColor: '#007bff', 
            color: 'white', 
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
          onClick={() => alert('Test réussi !')}
        >
          Cliquez ici pour tester
        </button>
      </div>
    </div>
  );
};

export default Index;
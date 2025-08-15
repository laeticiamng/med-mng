import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";

interface EdnItem {
  id: string;
  item_code: string;
  title: string;
  slug: string;
}

export default function EdnUltraSimple() {
  const [items, setItems] = useState<EdnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        console.log('Fetching EDN items...');
        
        const { data, error } = await supabase
          .from('edn_items_complete')
          .select('id, item_code, title, slug')
          .order('item_code')
          .limit(20);

        if (!mounted) return;

        if (error) {
          console.error('Supabase error:', error);
          setError('Erreur de chargement');
        } else {
          console.log('Loaded items:', data?.length || 0);
          setItems(data || []);
        }
      } catch (err) {
        if (!mounted) return;
        console.error('Network error:', err);
        setError('Erreur réseau');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>Chargement...</h1>
        <p>Veuillez patienter</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>Erreur</h1>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Interface EDN ({items.length} items)</h1>
      
      {items.length === 0 ? (
        <p>Aucun item trouvé</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
          {items.map((item) => (
            <Link 
              key={item.id}
              to={`/edn/${item.slug}`}
              style={{ 
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <div style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: '#fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#666', 
                  marginBottom: '8px',
                  padding: '4px 8px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  display: 'inline-block'
                }}>
                  {item.item_code}
                </div>
                <h3 style={{ 
                  margin: '0', 
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  {item.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
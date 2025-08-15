import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";

interface EdnItem {
  id: string;
  item_code: string;
  title: string;
  slug: string;
}

// Données statiques pour affichage immédiat (premiers 20 items)
const INITIAL_EDN_ITEMS: EdnItem[] = [
  { id: '1', item_code: 'IC-1', title: 'Examen clinique général', slug: 'ic-1' },
  { id: '2', item_code: 'IC-2', title: 'Système cardiovasculaire', slug: 'ic-2' },
  { id: '3', item_code: 'IC-3', title: 'Système respiratoire', slug: 'ic-3' },
  { id: '4', item_code: 'IC-4', title: 'Système digestif', slug: 'ic-4' },
  { id: '5', item_code: 'IC-5', title: 'Système nerveux', slug: 'ic-5' },
  { id: '6', item_code: 'IC-6', title: 'Système urinaire', slug: 'ic-6' },
  { id: '7', item_code: 'IC-7', title: 'Système endocrinien', slug: 'ic-7' },
  { id: '8', item_code: 'IC-8', title: 'Système musculo-squelettique', slug: 'ic-8' },
  { id: '9', item_code: 'IC-9', title: 'Dermatologie', slug: 'ic-9' },
  { id: '10', item_code: 'IC-10', title: 'Ophtalmologie', slug: 'ic-10' },
  { id: '11', item_code: 'IC-11', title: 'ORL', slug: 'ic-11' },
  { id: '12', item_code: 'IC-12', title: 'Gynécologie', slug: 'ic-12' },
  { id: '13', item_code: 'IC-13', title: 'Pédiatrie', slug: 'ic-13' },
  { id: '14', item_code: 'IC-14', title: 'Psychiatrie', slug: 'ic-14' },
  { id: '15', item_code: 'IC-15', title: 'Gériatrie', slug: 'ic-15' },
  { id: '16', item_code: 'IC-16', title: 'Urgences', slug: 'ic-16' },
  { id: '17', item_code: 'IC-17', title: 'Anesthésie', slug: 'ic-17' },
  { id: '18', item_code: 'IC-18', title: 'Chirurgie générale', slug: 'ic-18' },
  { id: '19', item_code: 'IC-19', title: 'Médecine interne', slug: 'ic-19' },
  { id: '20', item_code: 'IC-20', title: 'Radiologie', slug: 'ic-20' }
];

export default function EdnInstant() {
  const [items, setItems] = useState<EdnItem[]>(INITIAL_EDN_ITEMS);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(INITIAL_EDN_ITEMS.length);

  // Charger tous les items en arrière-plan après le rendu initial
  useEffect(() => {
    let mounted = true;

    const loadAllItems = async () => {
      try {
        const { data, error } = await supabase
          .from('edn_items_complete')
          .select('id, item_code, title, slug')
          .order('item_code');

        if (error) {
          console.error('Erreur chargement EDN:', error);
          return;
        }

        if (mounted && data) {
          console.log(`✅ ${data.length} items EDN chargés depuis la DB`);
          setItems(data);
          setTotalCount(data.length);
        }
      } catch (err) {
        console.error('Erreur réseau EDN:', err);
      }
    };

    // Délai court pour permettre le rendu initial, puis charger les vraies données
    const timeoutId = setTimeout(loadAllItems, 100);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  // Filtrage des items
  const filteredItems = searchTerm 
    ? items.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.item_code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : items;
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h1 style={{ 
        fontSize: '2rem', 
        fontWeight: 'bold', 
        marginBottom: '1rem',
        color: '#1a1a1a'
      }}>
        Interface EDN ({totalCount} items)
      </h1>
      
      {/* Barre de recherche */}
      <div style={{ marginBottom: '24px' }}>
        <input
          type="text"
          placeholder="Rechercher un item EDN..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '12px 16px',
            fontSize: '16px',
            border: '2px solid #e5e5e5',
            borderRadius: '8px',
            outline: 'none',
            transition: 'border-color 0.2s ease'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3b82f6';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e5e5';
          }}
        />
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '16px',
        marginTop: '24px'
      }}>
        {filteredItems.map((item) => (
          <Link 
            key={item.id}
            to={`/edn/${item.slug}`}
            style={{ 
              textDecoration: 'none',
              color: 'inherit',
              display: 'block'
            }}
          >
            <div style={{
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              padding: '16px',
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              height: '120px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}>
              <div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#666', 
                  marginBottom: '8px',
                  padding: '3px 8px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  display: 'inline-block',
                  fontWeight: '500'
                }}>
                  {item.item_code}
                </div>
                <h3 style={{ 
                  margin: '0', 
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1a1a1a',
                  lineHeight: '1.4'
                }}>
                  {item.title}
                </h3>
              </div>
              <div style={{
                display: 'flex',
                gap: '8px',
                marginTop: '12px'
              }}>
                <span style={{
                  fontSize: '11px',
                  color: '#059669',
                  backgroundColor: '#ecfdf5',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: '500'
                }}>
                  ✓ Rang A
                </span>
                <span style={{
                  fontSize: '11px',
                  color: '#0284c7',
                  backgroundColor: '#f0f9ff',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: '500'
                }}>
                  ✓ Rang B
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Message si aucun résultat */}
      {filteredItems.length === 0 && searchTerm && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          marginTop: '20px'
        }}>
          <p style={{ color: '#666', fontSize: '16px', margin: '0' }}>
            Aucun item trouvé pour "<strong>{searchTerm}</strong>"
          </p>
        </div>
      )}
      
      {/* Statistiques en bas */}
      <div style={{
        marginTop: '40px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <p style={{ 
          color: '#666', 
          fontSize: '14px',
          margin: '0'
        }}>
          💡 <strong>Navigation instantanée</strong> - {filteredItems.length} items affichés sur {totalCount} disponibles
          {searchTerm && ` (recherche: "${searchTerm}")`}
        </p>
      </div>
    </div>
  );
}
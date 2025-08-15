import React from 'react';
import { Link } from 'react-router-dom';

// Données statiques pour un rendu instantané
const STATIC_EDN_ITEMS = [
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
        Interface EDN ({STATIC_EDN_ITEMS.length} items)
      </h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '16px',
        marginTop: '24px'
      }}>
        {STATIC_EDN_ITEMS.map((item) => (
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
          💡 <strong>Navigation instantanée</strong> - Plus besoin d'attendre le chargement !
        </p>
      </div>
    </div>
  );
}
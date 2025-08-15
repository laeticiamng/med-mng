import React from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, CreditCard, BarChart3, Music, BookOpen, MessageSquare, Users, Activity, Brain, Settings, Sparkles, Zap, Target, Award, TrendingUp, Star } from "lucide-react";

const IndexOptimized = () => {
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  const buttonStyle = {
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
  };

  const cardStyle = {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    border: '2px solid #e2e8f0',
    borderRadius: '20px',
    padding: '32px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    position: 'relative' as const,
    overflow: 'hidden' as const
  };

  const heroButtonStyle = {
    ...buttonStyle,
    padding: '16px 32px',
    fontSize: '16px',
    borderRadius: '16px',
    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)'
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'relative'
    }}>
      
      {/* Éléments décoratifs en arrière-plan */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '100px',
        height: '100px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        top: '60%',
        right: '10%',
        width: '150px',
        height: '150px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite reverse'
      }} />

      {/* Header avec glassmorphism */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.2)',
        padding: '16px 0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            
            {/* Logo premium */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
              }}>
                <Sparkles size={24} color="white" />
              </div>
              <div>
                <h1 style={{ 
                  margin: 0, 
                  fontSize: '28px', 
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em'
                }}>
                  MED MNG
                </h1>
                <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontWeight: '500' }}>
                  Plateforme Premium IA
                </p>
              </div>
            </div>
            
            {/* Navigation moderne */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                style={buttonStyle}
                onClick={() => navigate('/edn')}
              >
                <Brain size={16} />
                EDN
              </button>
              <button
                style={buttonStyle}
                onClick={() => navigate('/generator')}
              >
                <Music size={16} />
                Générateur
              </button>
              <button
                style={buttonStyle}
                onClick={() => navigate('/ecos')}
                className="hidden sm:inline-flex"
              >
                <Users size={16} />
                ECOS
              </button>
              <button
                style={buttonStyle}
                onClick={() => navigate('/chat')}
              >
                <MessageSquare size={16} />
                Chat IA
              </button>
              <button
                style={buttonStyle}
                onClick={() => navigate('/library')}
                className="hidden md:inline-flex"
              >
                <BookOpen size={16} />
                Bibliothèque
              </button>
              {isAdmin && (
                <>
                  <button
                    style={buttonStyle}
                    onClick={() => navigate('/monitoring')}
                  >
                    <Activity size={16} />
                    Monitoring
                  </button>
                  <button
                    style={buttonStyle}
                    onClick={() => navigate('/admin/import')}
                    className="hidden lg:inline-flex"
                  >
                    <BarChart3 size={16} />
                    Import
                  </button>
                  <button
                    style={buttonStyle}
                    onClick={() => navigate('/admin-panel')}
                    className="hidden lg:inline-flex"
                  >
                    <Settings size={16} />
                    Admin Panel
                  </button>
                  <button
                    style={buttonStyle}
                    onClick={() => navigate('/audit')}
                    className="hidden xl:inline-flex"
                  >
                    <BarChart3 size={16} />
                    Audit
                  </button>
                </>
              )}
              <button
                style={{...buttonStyle, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}
                onClick={() => navigate('/med-mng/pricing')}
              >
                <CreditCard size={16} />
                Tarifs
              </button>
              <button
                style={{...buttonStyle, background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'}}
                onClick={() => navigate('/med-mng/login')}
              >
                <LogIn size={16} />
                Connexion
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* Hero section */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ 
            fontSize: '48px', 
            fontWeight: 'bold', 
            margin: '0 0 16px 0',
            background: 'linear-gradient(135deg, #1a1a1a 0%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            L'apprentissage médical réinventé
          </h2>
          <p style={{ 
            fontSize: '20px', 
            color: '#64748b', 
            margin: '0 0 32px 0',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Une plateforme complète avec IA pour l'apprentissage médical moderne
          </p>
        </div>

        {/* Grille des outils */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '24px',
          marginBottom: '60px'
        }}>
          
          {/* EDN Items */}
          <div 
            style={cardStyle}
            onClick={() => navigate('/edn')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <BookOpen size={28} color="white" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#1a1a1a' }}>
              Items EDN
            </h3>
            <p style={{ color: '#64748b', margin: '0 0 16px 0', lineHeight: '1.5' }}>
              Base complète IC-1 à IC-367 avec contenu immersif et compétences OIC
            </p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', background: '#dbeafe', color: '#1e40af', padding: '4px 8px', borderRadius: '4px' }}>
                367 items
              </span>
              <span style={{ fontSize: '12px', background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '4px' }}>
                4,872 compétences
              </span>
            </div>
            <button style={{...buttonStyle, width: '100%', justifyContent: 'center'}}>
              Explorer EDN
            </button>
          </div>

          {/* Générateur Musical */}
          <div 
            style={cardStyle}
            onClick={() => navigate('/generator')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <Music size={28} color="white" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#1a1a1a' }}>
              Générateur Musical IA
            </h3>
            <p style={{ color: '#64748b', margin: '0 0 16px 0', lineHeight: '1.5' }}>
              Génération rapide de musique éducative personnalisée avec IA
            </p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', background: '#fef3c7', color: '#92400e', padding: '4px 8px', borderRadius: '4px' }}>
                IA Suno
              </span>
              <span style={{ fontSize: '12px', background: '#fce7f3', color: '#be185d', padding: '4px 8px', borderRadius: '4px' }}>
                Styles variés
              </span>
            </div>
            <button style={{...buttonStyle, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', width: '100%', justifyContent: 'center'}}>
              Générer Maintenant
            </button>
          </div>

          {/* ECOS */}
          <div 
            style={cardStyle}
            onClick={() => navigate('/ecos')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <Users size={28} color="white" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#1a1a1a' }}>
              Simulations ECOS
            </h3>
            <p style={{ color: '#64748b', margin: '0 0 16px 0', lineHeight: '1.5' }}>
              Examens Cliniques Objectifs Structurés pour la pratique clinique
            </p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', background: '#d1fae5', color: '#065f46', padding: '4px 8px', borderRadius: '4px' }}>
                3 scénarios
              </span>
              <span style={{ fontSize: '12px', background: '#dbeafe', color: '#1e40af', padding: '4px 8px', borderRadius: '4px' }}>
                Évaluation
              </span>
            </div>
            <button style={{...buttonStyle, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', width: '100%', justifyContent: 'center'}}>
              Commencer ECOS
            </button>
          </div>

          {/* Chat IA */}
          <div 
            style={cardStyle}
            onClick={() => navigate('/chat')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <MessageSquare size={28} color="white" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#1a1a1a' }}>
              Assistant IA
            </h3>
            <p style={{ color: '#64748b', margin: '0 0 16px 0', lineHeight: '1.5' }}>
              Assistant intelligent connecté à vos cours médicaux
            </p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', background: '#ede9fe', color: '#6b21a8', padding: '4px 8px', borderRadius: '4px' }}>
                Chat temps réel
              </span>
              <span style={{ fontSize: '12px', background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '4px' }}>
                Base médicale
              </span>
            </div>
            <button style={{...buttonStyle, background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', width: '100%', justifyContent: 'center'}}>
              Démarrer Chat
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          background: 'rgba(255,255,255,0.5)',
          borderRadius: '12px',
          border: '1px solid rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 16px 0', color: '#1a1a1a' }}>
            Navigation Ultra-Rapide ⚡
          </h3>
          <p style={{ color: '#64748b', margin: '0', fontSize: '16px' }}>
            Plus d'attente ! Toutes les pages s'ouvrent instantanément.
          </p>
        </div>
      </div>
    </div>
  );
};

export default IndexOptimized;
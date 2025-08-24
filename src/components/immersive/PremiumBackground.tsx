import React, { useEffect, useState } from 'react';

interface PremiumBackgroundProps {
  variant?: 'medical' | 'music' | 'learning' | 'dashboard' | 'creative';
  intensity?: 'low' | 'medium' | 'high';
}

export const PremiumBackground: React.FC<PremiumBackgroundProps> = ({ 
  variant = 'medical', 
  intensity = 'medium' 
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const getVariantClasses = () => {
    switch (variant) {
      case 'medical':
        return 'from-slate-900/95 via-blue-900/90 to-indigo-900/95';
      case 'music':
        return 'from-purple-900/95 via-pink-900/90 to-indigo-900/95';
      case 'learning':
        return 'from-green-900/95 via-teal-900/90 to-blue-900/95';
      case 'dashboard':
        return 'from-gray-900/95 via-slate-900/90 to-zinc-900/95';
      case 'creative':
        return 'from-orange-900/95 via-red-900/90 to-pink-900/95';
      default:
        return 'from-slate-900/95 via-blue-900/90 to-indigo-900/95';
    }
  };

  const getIntensityOpacity = () => {
    switch (intensity) {
      case 'low': return 0.1;
      case 'medium': return 0.2;
      case 'high': return 0.3;
      default: return 0.2;
    }
  };

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getVariantClasses()}`} />
      
      {/* Animated orbs */}
      <div className="absolute inset-0">
        <div 
          className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"
          style={{
            top: '20%',
            left: '20%',
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
          }}
        />
        <div 
          className="absolute w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"
          style={{
            bottom: '20%',
            right: '20%',
            transform: `translate(-${mousePosition.x * 0.015}px, -${mousePosition.y * 0.015}px)`,
          }}
        />
        <div 
          className="absolute w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-500"
          style={{
            top: '50%',
            left: '50%',
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
          }}
        />
        
        {intensity !== 'low' && (
          <>
            <div 
              className="absolute w-48 h-48 bg-teal-500/15 rounded-full blur-2xl animate-pulse delay-700"
              style={{
                top: '10%',
                right: '30%',
                transform: `translate(${mousePosition.x * 0.008}px, ${mousePosition.y * 0.008}px)`,
              }}
            />
            <div 
              className="absolute w-72 h-72 bg-pink-500/15 rounded-full blur-3xl animate-pulse delay-300"
              style={{
                bottom: '10%',
                left: '40%',
                transform: `translate(-${mousePosition.x * 0.012}px, -${mousePosition.y * 0.012}px)`,
              }}
            />
          </>
        )}
      </div>

      {/* Floating particles */}
      {intensity === 'high' && (
        <div className="absolute inset-0">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/10 rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${3 + Math.random() * 4}s infinite linear`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Mesh gradient overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, ${getIntensityOpacity()}) 0%, transparent 50%)`,
        }}
      />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(120deg); }
          66% { transform: translateY(-10px) rotate(240deg); }
        }
      `}</style>
    </div>
  );
};
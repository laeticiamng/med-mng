import React, { useEffect, useState } from 'react';

interface Layer {
  id: string;
  depth: number;
  opacity: number;
  color: string;
}

export const ParallaxBackground: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const layers: Layer[] = [
    { id: 'layer1', depth: 0.1, opacity: 0.1, color: 'bg-gradient-to-br from-purple-600/20 to-pink-600/20' },
    { id: 'layer2', depth: 0.2, opacity: 0.15, color: 'bg-gradient-to-tl from-blue-600/20 to-indigo-600/20' },
    { id: 'layer3', depth: 0.3, opacity: 0.1, color: 'bg-gradient-to-tr from-emerald-600/20 to-cyan-600/20' }
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {layers.map((layer) => (
        <div
          key={layer.id}
          className={`absolute inset-0 ${layer.color}`}
          style={{
            transform: `translateY(${scrollY * layer.depth}px)`,
            opacity: layer.opacity
          }}
        />
      ))}
      
      {/* Mesh gradient overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)
          `
        }}
      />
    </div>
  );
};
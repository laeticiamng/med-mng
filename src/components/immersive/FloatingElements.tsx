import React, { useEffect, useState } from 'react';
import { Music, Brain, BookOpen, Heart, Star, Zap } from 'lucide-react';

interface FloatingElement {
  id: string;
  icon: React.ComponentType<any>;
  x: number;
  y: number;
  speed: number;
  rotation: number;
  color: string;
}

export const FloatingElements: React.FC = () => {
  const [elements, setElements] = useState<FloatingElement[]>([]);

  useEffect(() => {
    const icons = [Music, Brain, BookOpen, Heart, Star, Zap];
    const colors = [
      'text-pink-400/30',
      'text-purple-400/30',
      'text-blue-400/30',
      'text-indigo-400/30',
      'text-cyan-400/30',
      'text-emerald-400/30'
    ];

    const initialElements: FloatingElement[] = Array.from({ length: 12 }, (_, i) => ({
      id: `element-${i}`,
      icon: icons[Math.floor(Math.random() * icons.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      speed: Math.random() * 0.5 + 0.1,
      rotation: Math.random() * 360,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));

    setElements(initialElements);

    const interval = setInterval(() => {
      setElements(prev =>
        prev.map(element => ({
          ...element,
          y: (element.y + element.speed) % 110,
          rotation: (element.rotation + 0.5) % 360
        }))
      );
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {elements.map((element) => {
        const Icon = element.icon;
        return (
          <div
            key={element.id}
            className="absolute transition-all duration-100 ease-linear"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              transform: `rotate(${element.rotation}deg)`
            }}
          >
            <Icon className={`h-6 w-6 ${element.color}`} />
          </div>
        );
      })}
    </div>
  );
};
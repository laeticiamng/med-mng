import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface InteractiveParticlesProps {
  density?: number;
  interactive?: boolean;
  colors?: string[];
  className?: string;
}

export const InteractiveParticles: React.FC<InteractiveParticlesProps> = ({
  density = 0.5,
  interactive = true,
  colors = ['#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#F59E0B'],
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>();

  // Créer une particule
  const createParticle = (x: number, y: number): Particle => ({
    id: Math.random(),
    x,
    y,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    life: 0,
    maxLife: 100 + Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 2 + Math.random() * 3
  });

  // Initialiser les particules
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const particleCount = Math.floor((rect.width * rect.height) / 10000 * density);
    
    const initialParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      initialParticles.push(createParticle(
        Math.random() * rect.width,
        Math.random() * rect.height
      ));
    }
    setParticles(initialParticles);
  }, [density, colors]);

  // Gérer le mouvement de la souris
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };

    const handleMouseEnter = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const newParticles: Particle[] = [];
      for (let i = 0; i < 5; i++) {
        newParticles.push(createParticle(
          e.clientX - rect.left + (Math.random() - 0.5) * 20,
          e.clientY - rect.top + (Math.random() - 0.5) * 20
        ));
      }
      setParticles(prev => [...prev, ...newParticles]);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [interactive, colors]);

  // Animation des particules
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      setParticles(prevParticles => {
        const updatedParticles = prevParticles
          .map(particle => {
            // Attraction vers la souris si interactive
            if (interactive) {
              const dx = mousePos.x - particle.x;
              const dy = mousePos.y - particle.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              if (distance < 100) {
                const force = (100 - distance) / 100 * 0.02;
                particle.vx += (dx / distance) * force;
                particle.vy += (dy / distance) * force;
              }
            }

            // Mise à jour de la position
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life += 1;

            // Friction
            particle.vx *= 0.99;
            particle.vy *= 0.99;

            // Rebond sur les bords
            if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -0.8;
            if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -0.8;

            // Garder dans les limites
            particle.x = Math.max(0, Math.min(canvas.width, particle.x));
            particle.y = Math.max(0, Math.min(canvas.height, particle.y));

            return particle;
          })
          .filter(particle => particle.life < particle.maxLife);

        // Dessiner les particules
        updatedParticles.forEach(particle => {
          const alpha = 1 - (particle.life / particle.maxLife);
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
          ctx.fill();
          
          // Effet de brillance
          ctx.globalAlpha = alpha * 0.5;
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(particle.x - particle.size * 0.3, particle.y - particle.size * 0.3, particle.size * 0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        // Connexions entre particules proches
        if (interactive) {
          updatedParticles.forEach((p1, i) => {
            updatedParticles.slice(i + 1).forEach(p2 => {
              const dx = p1.x - p2.x;
              const dy = p1.y - p2.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              if (distance < 80) {
                const alpha = (80 - distance) / 80 * 0.3;
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.strokeStyle = '#8B5CF6';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
                ctx.restore();
              }
            });
          });
        }

        return updatedParticles;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mousePos, interactive]);

  // Ajuster la taille du canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <motion.canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
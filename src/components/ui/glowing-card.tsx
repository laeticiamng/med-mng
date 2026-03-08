import React, { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface GlowingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Glow color — defaults to primary */
  glowColor?: string;
  /** Glow intensity (0-1) */
  intensity?: number;
  /** Border radius */
  borderRadius?: number;
  children: React.ReactNode;
}

/**
 * GlowingCard — mouse-tracking glow effect on card borders.
 * Inspired by 21st.dev "Glowing Effect" (1k+ likes).
 * Uses design tokens for theming.
 */
export const GlowingCard: React.FC<GlowingCardProps> = ({
  glowColor = "hsl(var(--primary))",
  intensity = 0.4,
  borderRadius = 16,
  className,
  children,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [glowPosition, setGlowPosition] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setGlowPosition({ x, y });
    },
    []
  );

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative group transition-all duration-300",
        className
      )}
      style={{ borderRadius: `${borderRadius}px` }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {/* Glow layer */}
      <div
        className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(600px circle at ${glowPosition.x}% ${glowPosition.y}%, ${glowColor} 0%, transparent 70%)`,
          opacity: isHovered ? intensity : 0,
        }}
      />
      {/* Border */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] border border-border/50 group-hover:border-primary/30 transition-colors duration-500"
      />
      {/* Content */}
      <div className="relative z-10 rounded-[inherit] bg-card/80 backdrop-blur-xl overflow-hidden">
        {children}
      </div>
    </div>
  );
};

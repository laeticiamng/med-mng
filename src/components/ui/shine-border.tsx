import React from "react";
import { cn } from "@/lib/utils";

interface ShineBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Border radius in pixels */
  borderRadius?: number;
  /** Width of the shine border in pixels */
  borderWidth?: number;
  /** Duration of the animation in seconds */
  duration?: number;
  /** Colors for the shine gradient - uses HSL design tokens */
  colors?: string[];
  children: React.ReactNode;
}

/**
 * ShineBorder — animated rotating gradient border effect.
 * Inspired by 21st.dev/community trending "Shine Border" pattern.
 */
export const ShineBorder: React.FC<ShineBorderProps> = ({
  borderRadius = 14,
  borderWidth = 2,
  duration = 8,
  colors = [
    "hsl(var(--primary))",
    "hsl(var(--accent))",
    "hsl(var(--warning))",
  ],
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn("relative overflow-hidden rounded-[--radius]", className)}
      style={
        {
          "--border-radius": `${borderRadius}px`,
          "--border-width": `${borderWidth}px`,
          "--shine-duration": `${duration}s`,
          "--shine-color-1": colors[0],
          "--shine-color-2": colors[1],
          "--shine-color-3": colors[2] || colors[0],
          borderRadius: `${borderRadius}px`,
          padding: `${borderWidth}px`,
        } as React.CSSProperties
      }
      {...props}
    >
      {/* Animated gradient border */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          borderRadius: `${borderRadius}px`,
          background: `conic-gradient(from 0deg, ${colors.join(", ")}, ${colors[0]})`,
          animation: `shine-rotate var(--shine-duration) linear infinite`,
        }}
      />
      {/* Content container */}
      <div
        className="relative z-10 bg-card"
        style={{ borderRadius: `${borderRadius - borderWidth}px` }}
      >
        {children}
      </div>
    </div>
  );
};

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * BentoGrid — asymmetric grid layout inspired by 21st.dev trending pattern.
 */
export const BentoGrid: React.FC<BentoGridProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface BentoCardProps {
  /** Span 2 columns on large screens */
  colSpan?: 1 | 2;
  /** Span 2 rows */
  rowSpan?: 1 | 2;
  /** Index for stagger animation */
  index?: number;
  children: React.ReactNode;
  className?: string;
}

export const BentoCard: React.FC<BentoCardProps> = ({
  colSpan = 1,
  rowSpan = 1,
  index = 0,
  className,
  children,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl",
        "transition-all duration-500 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5",
        colSpan === 2 && "lg:col-span-2",
        rowSpan === 2 && "lg:row-span-2",
        className
      )}
      {...props}
    >
      {/* Subtle shine sweep on hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/[0.04] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      </div>
      {children}
    </motion.div>
  );
};

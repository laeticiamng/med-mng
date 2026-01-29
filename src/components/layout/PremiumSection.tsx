import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PremiumSectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  badge?: string;
  centered?: boolean;
  animate?: boolean;
}

/**
 * Section premium avec animations de reveal au scroll
 */
export const PremiumSection: React.FC<PremiumSectionProps> = ({
  children,
  className,
  title,
  subtitle,
  badge,
  centered = false,
  animate = true
}) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const content = (
    <>
      {(badge || title || subtitle) && (
        <div className={cn("mb-12", centered && "text-center")}>
          {badge && (
            <motion.div
              variants={animate ? itemVariants : undefined}
              className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 mb-6"
            >
              <span className="text-sm font-medium text-primary">{badge}</span>
            </motion.div>
          )}
          
          {title && (
            <motion.h2
              variants={animate ? itemVariants : undefined}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4"
            >
              <span className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
                {title}
              </span>
            </motion.h2>
          )}
          
          {subtitle && (
            <motion.p
              variants={animate ? itemVariants : undefined}
              className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto"
            >
              {subtitle}
            </motion.p>
          )}
        </div>
      )}
      
      <motion.div variants={animate ? itemVariants : undefined}>
        {children}
      </motion.div>
    </>
  );

  if (animate) {
    return (
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className={cn("py-16 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto", className)}
      >
        {content}
      </motion.section>
    );
  }

  return (
    <section className={cn("py-16 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto", className)}>
      {content}
    </section>
  );
};

// ==========================================
// MICRO INTERACTIONS - Interactions subtiles et élégantes
// ==========================================

import React, { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Star, 
  CheckCircle, 
  Zap, 
  Sparkles,
  ThumbsUp,
  Share2,
  Download,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Bookmark,
  Copy,
  Send
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Animated Heart Button
export const AnimatedHeartButton = memo(({ 
  isLiked = false, 
  onToggle,
  count = 0 
}: { 
  isLiked?: boolean; 
  onToggle?: () => void;
  count?: number;
}) => {
  const [liked, setLiked] = useState(isLiked);
  const [currentCount, setCurrentCount] = useState(count);
  
  const handleClick = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setCurrentCount(prev => newLiked ? prev + 1 : Math.max(0, prev - 1));
    onToggle?.();
  };

  return (
    <motion.button
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200",
        liked 
          ? "bg-red-500/10 text-red-500 border border-red-500/20" 
          : "bg-muted/50 text-muted-foreground hover:bg-muted/80"
      )}
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={liked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Heart 
          className={cn(
            "h-4 w-4 transition-all duration-200",
            liked ? "fill-red-500 text-red-500" : ""
          )} 
        />
      </motion.div>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentCount}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="text-sm font-medium"
        >
          {currentCount}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
});

// Animated Star Rating
export const AnimatedStarRating = memo(({ 
  rating = 0, 
  maxRating = 5, 
  onRate,
  readonly = false 
}: { 
  rating?: number; 
  maxRating?: number; 
  onRate?: (rating: number) => void;
  readonly?: boolean;
}) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  const [currentRating, setCurrentRating] = useState(rating);

  const handleClick = (value: number) => {
    if (readonly) return;
    setCurrentRating(value);
    onRate?.(value);
  };

  return (
    <div className="flex items-center gap-1">
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        const isActive = starValue <= (hoveredRating || currentRating);
        
        return (
          <motion.button
            key={index}
            className={cn(
              "p-1 rounded transition-colors",
              !readonly && "hover:bg-muted/50"
            )}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => !readonly && setHoveredRating(starValue)}
            onMouseLeave={() => !readonly && setHoveredRating(0)}
            whileHover={!readonly ? { scale: 1.1 } : {}}
            whileTap={!readonly ? { scale: 0.9 } : {}}
            disabled={readonly}
          >
            <motion.div
              animate={isActive ? { scale: [1, 1.2, 1] } : { scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Star 
                className={cn(
                  "h-5 w-5 transition-all duration-200",
                  isActive 
                    ? "fill-yellow-400 text-yellow-400" 
                    : "text-muted-foreground"
                )} 
              />
            </motion.div>
          </motion.button>
        );
      })}
    </div>
  );
});

// Success Checkmark Animation
export const SuccessCheckmark = memo(({ 
  visible = false, 
  message = "Succès !",
  onComplete 
}: { 
  visible?: boolean; 
  message?: string;
  onComplete?: () => void;
}) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [visible, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed top-4 right-4 z-50"
        >
          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="p-4 flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              >
                <CheckCircle className="h-5 w-5 text-green-500" />
              </motion.div>
              <span className="text-green-600 font-medium">{message}</span>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

// Floating Action Button with Tooltip
export const FloatingActionButton = memo(({ 
  icon: Icon, 
  tooltip, 
  onClick,
  variant = "primary",
  size = "md"
}: { 
  icon: React.ComponentType<any>; 
  tooltip?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "success" | "warning";
  size?: "sm" | "md" | "lg";
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-14 h-14"
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };

  const variantClasses = {
    primary: "bg-primary text-primary-foreground shadow-lg shadow-primary/20",
    secondary: "bg-secondary text-secondary-foreground shadow-lg shadow-secondary/20",
    success: "bg-green-500 text-white shadow-lg shadow-green-500/20",
    warning: "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
  };

  return (
    <div className="relative">
      <motion.button
        className={cn(
          "rounded-full flex items-center justify-center transition-all duration-200",
          sizeClasses[size],
          variantClasses[variant]
        )}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onClick={onClick}
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.95 }}
        animate={{ 
          boxShadow: isPressed 
            ? "0 4px 20px rgba(0,0,0,0.15)" 
            : "0 8px 30px rgba(0,0,0,0.12)"
        }}
      >
        <Icon className={iconSizes[size]} />
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && tooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2"
          >
            <div className="bg-background border border-border rounded-lg px-3 py-2 shadow-lg">
              <span className="text-sm font-medium whitespace-nowrap">{tooltip}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// Animated Progress Badge
export const ProgressBadge = memo(({ 
  current = 0, 
  total = 100, 
  label = "Progress",
  showPercentage = true 
}: { 
  current?: number; 
  total?: number; 
  label?: string;
  showPercentage?: boolean;
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const percentage = Math.round((current / total) * 100);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(current);
    }, 100);
    return () => clearTimeout(timer);
  }, [current]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative"
    >
      <Badge variant="secondary" className="pr-8">
        <Zap className="h-3 w-3 mr-1" />
        {label}: {animatedValue}/{total}
        {showPercentage && ` (${percentage}%)`}
      </Badge>
      
      {/* Progress indicator */}
      <motion.div
        className="absolute right-2 top-1/2 transform -translate-y-1/2"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Sparkles className="h-3 w-3 text-primary" />
      </motion.div>
    </motion.div>
  );
});

// Ripple Effect Button
export const RippleButton = memo(({ 
  children, 
  onClick, 
  className,
  variant = "default",
  size = "default",
  ...props 
}: { 
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: string;
  size?: string;
  [key: string]: any;
}) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = {
      id: Date.now(),
      x,
      y
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
    
    onClick?.();
  };

  return (
    <Button
      className={cn("relative overflow-hidden", className)}
      onClick={handleClick}
      variant={variant as any}
      size={size as any}
      {...props}
    >
      {children}
      
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <motion.div
          key={ripple.id}
          className="absolute bg-white/30 rounded-full pointer-events-none"
          initial={{
            width: 0,
            height: 0,
            x: ripple.x,
            y: ripple.y,
            opacity: 1
          }}
          animate={{
            width: 200,
            height: 200,
            x: ripple.x - 100,
            y: ripple.y - 100,
            opacity: 0
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ))}
    </Button>
  );
});

export default {
  AnimatedHeartButton,
  AnimatedStarRating,
  SuccessCheckmark,
  FloatingActionButton,
  ProgressBadge,
  RippleButton
};
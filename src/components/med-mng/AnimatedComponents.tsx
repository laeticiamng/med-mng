import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Music, Play, Pause, Volume2, Heart, Star } from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const slideInLeft = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 }
};

interface AnimatedCardProps {
  title: string;
  content: string;
  delay?: number;
  className?: string;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({ 
  title, 
  content, 
  delay = 0,
  className = "" 
}) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeInUp}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{content}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface AnimatedProgressProps {
  value: number;
  label: string;
  className?: string;
}

export const AnimatedProgress: React.FC<AnimatedProgressProps> = ({ 
  value, 
  label, 
  className = "" 
}) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={slideInLeft}
      transition={{ duration: 0.6 }}
      className={className}
    >
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>{label}</span>
          <span>{value}%</span>
        </div>
        <Progress value={value} className="h-2" />
      </div>
    </motion.div>
  );
};

interface FloatingActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  isActive?: boolean;
  className?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  icon,
  isActive = false,
  className = ""
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      variants={scaleIn}
      initial="initial"
      animate="animate"
      className={className}
    >
      <Button
        size="icon"
        variant={isActive ? "default" : "outline"}
        onClick={onClick}
        className="rounded-full w-12 h-12 shadow-lg"
      >
        {icon}
      </Button>
    </motion.div>
  );
};

interface AnimatedBadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline";
  pulse?: boolean;
  className?: string;
}

export const AnimatedBadge: React.FC<AnimatedBadgeProps> = ({
  children,
  variant = "default",
  pulse = false,
  className = ""
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        ...(pulse && {
          scale: [1, 1.05, 1],
          transition: { duration: 2, repeat: Infinity }
        })
      }}
      className={className}
    >
      <Badge variant={variant} className="animate-pulse">
        {children}
      </Badge>
    </motion.div>
  );
};

interface StaggeredListProps {
  items: Array<{ id: string; content: React.ReactNode }>;
  className?: string;
}

export const StaggeredList: React.FC<StaggeredListProps> = ({ items, className = "" }) => {
  const containerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className={className}
    >
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          variants={itemVariants}
          className="mb-2"
        >
          {item.content}
        </motion.div>
      ))}
    </motion.div>
  );
};

interface PulsingHeartProps {
  isLiked: boolean;
  onClick: () => void;
  className?: string;
}

export const PulsingHeart: React.FC<PulsingHeartProps> = ({
  isLiked,
  onClick,
  className = ""
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.8 }}
      onClick={onClick}
      className={`p-2 ${className}`}
    >
      <motion.div
        animate={isLiked ? {
          scale: [1, 1.3, 1],
          transition: { duration: 0.3 }
        } : {}}
      >
        <Heart 
          className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
        />
      </motion.div>
    </motion.button>
  );
};

interface BouncingStarProps {
  rating: number;
  onRate: (rating: number) => void;
  className?: string;
}

export const BouncingStar: React.FC<BouncingStarProps> = ({
  rating,
  onRate,
  className = ""
}) => {
  return (
    <div className={`flex gap-1 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          whileHover={{ scale: 1.2, rotate: 15 }}
          whileTap={{ scale: 0.8 }}
          onClick={() => onRate(star)}
          className="p-1"
        >
          <Star
            className={`h-5 w-5 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
            }`}
          />
        </motion.button>
      ))}
    </div>
  );
};
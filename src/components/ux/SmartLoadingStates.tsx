import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Sparkles, Heart, Music, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface SmartLoadingStatesProps {
  type?: 'default' | 'medical' | 'music' | 'edn' | 'premium';
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  progress?: number;
  className?: string;
}

export const SmartLoadingStates: React.FC<SmartLoadingStatesProps> = ({
  type = 'default',
  size = 'md',
  message,
  progress,
  className = ''
}) => {
  const getIcon = () => {
    switch (type) {
      case 'medical': return <Heart className="text-red-500" />;
      case 'music': return <Music className="text-purple-500" />;
      case 'edn': return <BookOpen className="text-blue-500" />;
      case 'premium': return <Sparkles className="text-gold-500" />;
      default: return <Loader2 className="text-primary animate-spin" />;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-6 h-6';
      case 'lg': return 'w-12 h-12';
      default: return 'w-8 h-8';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col items-center justify-center p-8 ${className}`}
    >
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <div className={`${getSizeClasses()} flex items-center justify-center`}>
              {getIcon()}
            </div>
            <p className="text-center text-muted-foreground">{message || 'Chargement...'}</p>
            {progress !== undefined && (
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
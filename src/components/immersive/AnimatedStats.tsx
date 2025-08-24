import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, Award, Zap } from 'lucide-react';
import { ImmersiveCard } from './ImmersiveCard';

interface StatItem {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'purple' | 'green' | 'orange' | 'pink';
  suffix?: string;
  format?: 'number' | 'percentage' | 'duration';
}

interface AnimatedStatsProps {
  stats: StatItem[];
  animationDelay?: number;
  className?: string;
}

export const AnimatedStats: React.FC<AnimatedStatsProps> = ({
  stats,
  animationDelay = 100,
  className = ''
}) => {
  const [animatedValues, setAnimatedValues] = useState<number[]>(
    new Array(stats.length).fill(0)
  );

  useEffect(() => {
    stats.forEach((stat, index) => {
      setTimeout(() => {
        const duration = 2000; // 2 seconds animation
        const steps = 60; // 60fps
        const stepValue = stat.value / steps;
        let currentStep = 0;

        const interval = setInterval(() => {
          if (currentStep >= steps) {
            setAnimatedValues(prev => {
              const newValues = [...prev];
              newValues[index] = stat.value;
              return newValues;
            });
            clearInterval(interval);
          } else {
            setAnimatedValues(prev => {
              const newValues = [...prev];
              newValues[index] = Math.floor(stepValue * currentStep);
              return newValues;
            });
            currentStep++;
          }
        }, duration / steps);
      }, index * animationDelay);
    });
  }, [stats, animationDelay]);

  const formatValue = (value: number, format?: string, suffix?: string) => {
    let formatted = value.toString();
    
    switch (format) {
      case 'percentage':
        formatted = `${value}%`;
        break;
      case 'duration':
        if (value >= 3600) {
          const hours = Math.floor(value / 3600);
          const minutes = Math.floor((value % 3600) / 60);
          formatted = `${hours}h ${minutes}m`;
        } else if (value >= 60) {
          const minutes = Math.floor(value / 60);
          const seconds = value % 60;
          formatted = `${minutes}m ${seconds}s`;
        } else {
          formatted = `${value}s`;
        }
        break;
      case 'number':
      default:
        // Add thousand separators
        formatted = value.toLocaleString();
        break;
    }
    
    return suffix ? `${formatted}${suffix}` : formatted;
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'text-blue-400 bg-blue-500/20 border-blue-400/30',
      purple: 'text-purple-400 bg-purple-500/20 border-purple-400/30',
      green: 'text-green-400 bg-green-500/20 border-green-400/30',
      orange: 'text-orange-400 bg-orange-500/20 border-orange-400/30',
      pink: 'text-pink-400 bg-pink-500/20 border-pink-400/30',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 ${className}`}>
      {stats.map((stat, index) => (
        <ImmersiveCard 
          key={index} 
          glow={stat.color}
          variant="glass"
          hover={true}
          className="text-center"
        >
          <div className="space-y-3">
            {/* Icon */}
            <div className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center ${getColorClasses(stat.color)}`}>
              {stat.icon}
            </div>
            
            {/* Value */}
            <div className={`text-2xl md:text-3xl font-bold ${getColorClasses(stat.color).split(' ')[0]} mb-1`}>
              {formatValue(animatedValues[index], stat.format, stat.suffix)}
            </div>
            
            {/* Label */}
            <div className="text-sm text-gray-300 font-medium">
              {stat.label}
            </div>
          </div>
        </ImmersiveCard>
      ))}
    </div>
  );
};
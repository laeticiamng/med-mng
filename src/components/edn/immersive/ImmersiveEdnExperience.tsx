import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, Eye, Music, GamepadIcon, Settings } from 'lucide-react';

interface ImmersiveEdnExperienceProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  item: any;
  children: React.ReactNode;
}

export const ImmersiveEdnExperience: React.FC<ImmersiveEdnExperienceProps> = ({ 
  activeSection, 
  onSectionChange, 
  item,
  children 
}) => {
  const [sessionTime, setSessionTime] = useState(0);
  const [engagementScore, setEngagementScore] = useState(100);

  useEffect(() => {
    const timer = setInterval(() => setSessionTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header immersif */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{item?.title}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{formatTime(sessionTime)}</span>
                  <span>{engagementScore}% engagement</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="mt-3">
            <Progress value={75} className="h-2" />
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Indicateur de progression flottant */}
      <div className="fixed bottom-6 right-6 z-40">
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
          <CardContent className="p-3 text-center">
            <div className="text-lg font-bold text-gray-900">75%</div>
            <div className="text-xs text-gray-600">Progression</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Palette, 
  Sparkles, 
  Eye,
  Clock,
  CheckCircle,
  Play,
  Pause
} from "lucide-react";

interface ReadingSession {
  contentType: string;
  startTime: number;
  currentProgress: number;
  totalContent: number;
  isActive: boolean;
}

interface ContentProgressTrackerProps {
  itemCode: string;
  contentType: 'bd' | 'roman' | 'poeme';
  totalContent: number;
  onProgressUpdate?: (progress: number) => void;
}

export const ContentProgressTracker: React.FC<ContentProgressTrackerProps> = ({
  itemCode,
  contentType,
  totalContent,
  onProgressUpdate
}) => {
  const [session, setSession] = useState<ReadingSession>({
    contentType,
    startTime: 0,
    currentProgress: 0,
    totalContent,
    isActive: false
  });
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (session.isActive) {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [session.isActive]);

  const startSession = () => {
    setSession(prev => ({
      ...prev,
      isActive: true,
      startTime: Date.now()
    }));
  };

  const pauseSession = () => {
    setSession(prev => ({ ...prev, isActive: false }));
  };

  const updateProgress = (progress: number) => {
    const newProgress = Math.min(progress, 100);
    setSession(prev => ({ ...prev, currentProgress: newProgress }));
    onProgressUpdate?.(newProgress);
  };

  const getContentIcon = () => {
    switch (contentType) {
      case 'bd': return <Palette className="h-4 w-4" />;
      case 'roman': return <BookOpen className="h-4 w-4" />;
      case 'poeme': return <Sparkles className="h-4 w-4" />;
    }
  };

  const getContentLabel = () => {
    switch (contentType) {
      case 'bd': return 'Bande Dessinée';
      case 'roman': return 'Roman';
      case 'poeme': return 'Poème';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isCompleted = session.currentProgress >= 100;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          {getContentIcon()}
          {getContentLabel()}
          <Badge variant="outline" className="ml-auto">
            {itemCode}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progression</span>
            <span className="font-medium">{Math.round(session.currentProgress)}%</span>
          </div>
          <Progress value={session.currentProgress} className="w-full" />
        </div>

        {/* Session Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!session.isActive ? (
              <Button size="sm" onClick={startSession} variant="outline">
                <Play className="h-3 w-3 mr-1" />
                Démarrer
              </Button>
            ) : (
              <Button size="sm" onClick={pauseSession} variant="outline">
                <Pause className="h-3 w-3 mr-1" />
                Pause
              </Button>
            )}
            
            {isCompleted && (
              <Badge variant="default" className="bg-success">
                <CheckCircle className="h-3 w-3 mr-1" />
                Terminé
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatTime(timeSpent)}
          </div>
        </div>

        {/* Reading Stats */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Éléments vus</p>
            <p className="text-lg font-semibold">
              {Math.round((session.currentProgress / 100) * totalContent)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Restants</p>
            <p className="text-lg font-semibold">
              {totalContent - Math.round((session.currentProgress / 100) * totalContent)}
            </p>
          </div>
        </div>

        {/* Quick Progress Buttons */}
        <div className="flex gap-1">
          {[25, 50, 75, 100].map(percent => (
            <Button
              key={percent}
              size="sm"
              variant="ghost"
              onClick={() => updateProgress(percent)}
              className="flex-1 text-xs"
              disabled={session.currentProgress >= percent}
            >
              {percent}%
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
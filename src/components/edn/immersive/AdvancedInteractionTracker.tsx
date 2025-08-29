import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Mouse, 
  Keyboard, 
  Eye, 
  Clock, 
  TrendingUp,
  Focus,
  Zap,
  Brain,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';

interface InteractionData {
  clicks: number;
  scrolls: number;
  keyPresses: number;
  timeSpent: number;
  focusTime: number;
  idleTime: number;
  hoveredElements: string[];
  readingPattern: 'linear' | 'scanning' | 'focused' | 'random';
  engagementLevel: 'low' | 'medium' | 'high' | 'peak';
  cognitiveLoad: number; // 0-100
  retentionScore: number; // 0-100
}

interface AdvancedInteractionTrackerProps {
  sectionId: string;
  onDataUpdate: (data: InteractionData) => void;
  children: React.ReactNode;
}

export const AdvancedInteractionTracker: React.FC<AdvancedInteractionTrackerProps> = ({
  sectionId,
  onDataUpdate,
  children
}) => {
  const [interactionData, setInteractionData] = useState<InteractionData>({
    clicks: 0,
    scrolls: 0,
    keyPresses: 0,
    timeSpent: 0,
    focusTime: 0,
    idleTime: 0,
    hoveredElements: [],
    readingPattern: 'linear',
    engagementLevel: 'medium',
    cognitiveLoad: 50,
    retentionScore: 75
  });

  const [isVisible, setIsVisible] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollBehavior, setScrollBehavior] = useState<'smooth' | 'rapid' | 'erratic'>('smooth');
  const [readingSpeed, setReadingSpeed] = useState(0);

  // Tracking du focus/blur de la page
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    const handleFocus = () => setIsVisible(true);
    const handleBlur = () => setIsVisible(false);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Tracking des interactions
  useEffect(() => {
    let clickCount = 0;
    let scrollCount = 0;
    let keyCount = 0;
    let mouseMovements: { x: number; y: number; time: number }[] = [];
    let scrollEvents: { y: number; time: number }[] = [];

    const handleClick = (e: MouseEvent) => {
      clickCount++;
      setLastActivity(Date.now());
      
      // Analyser le type d'élément cliqué
      const target = e.target as HTMLElement;
      const elementType = target.tagName.toLowerCase();
      const hasInteractiveRole = target.getAttribute('role') || elementType;
      
      setInteractionData(prev => ({
        ...prev,
        clicks: prev.clicks + 1,
        hoveredElements: [...new Set([...prev.hoveredElements, hasInteractiveRole])]
      }));
    };

    const handleScroll = (e: Event) => {
      scrollCount++;
      setLastActivity(Date.now());
      
      const scrollY = window.scrollY;
      const now = Date.now();
      scrollEvents.push({ y: scrollY, time: now });
      
      // Analyser le comportement de scroll
      if (scrollEvents.length > 5) {
        const recentScrolls = scrollEvents.slice(-5);
        const speeds = recentScrolls.slice(1).map((scroll, i) => 
          Math.abs(scroll.y - recentScrolls[i].y) / (scroll.time - recentScrolls[i].time)
        );
        const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
        
        if (avgSpeed > 2) setScrollBehavior('rapid');
        else if (avgSpeed < 0.5) setScrollBehavior('smooth');
        else setScrollBehavior('erratic');
      }
      
      setInteractionData(prev => ({ ...prev, scrolls: prev.scrolls + 1 }));
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      keyCount++;
      setLastActivity(Date.now());
      setInteractionData(prev => ({ ...prev, keyPresses: prev.keyPresses + 1 }));
    };

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      mouseMovements.push({ x: e.clientX, y: e.clientY, time: now });
      setMousePosition({ x: e.clientX, y: e.clientY });
      setLastActivity(now);

      // Analyser les patterns de mouvement
      if (mouseMovements.length > 20) {
        mouseMovements = mouseMovements.slice(-20);
        // Calculer la complexité du mouvement pour évaluer l'engagement
        const complexity = calculateMovementComplexity(mouseMovements);
        
        setInteractionData(prev => ({
          ...prev,
          engagementLevel: complexity > 0.7 ? 'high' : complexity > 0.4 ? 'medium' : 'low'
        }));
      }
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('keypress', handleKeyPress);
    document.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('scroll', handleScroll);
      document.removeEventListener('keypress', handleKeyPress);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Calcul de la complexité des mouvements de souris
  const calculateMovementComplexity = (movements: { x: number; y: number; time: number }[]) => {
    if (movements.length < 2) return 0;

    let totalDistance = 0;
    let totalTime = 0;
    let directionChanges = 0;
    let previousDirection = 0;

    for (let i = 1; i < movements.length; i++) {
      const dx = movements[i].x - movements[i-1].x;
      const dy = movements[i].y - movements[i-1].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const time = movements[i].time - movements[i-1].time;
      
      totalDistance += distance;
      totalTime += time;

      if (i > 1) {
        const direction = Math.atan2(dy, dx);
        const angleDiff = Math.abs(direction - previousDirection);
        if (angleDiff > Math.PI / 4) { // Changement de direction > 45°
          directionChanges++;
        }
        previousDirection = direction;
      }
    }

    const avgSpeed = totalDistance / totalTime;
    const complexityScore = (directionChanges / movements.length) + (avgSpeed / 1000);
    return Math.min(complexityScore, 1);
  };

  // Timer principal
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;
      const isIdle = timeSinceLastActivity > 30000; // 30 secondes d'inactivité

      setInteractionData(prev => {
        const newData = {
          ...prev,
          timeSpent: prev.timeSpent + 1,
          focusTime: isVisible && !isIdle ? prev.focusTime + 1 : prev.focusTime,
          idleTime: isIdle ? prev.idleTime + 1 : prev.idleTime
        };

        // Calcul du score de rétention basé sur l'engagement
        const engagementScore = 
          (newData.clicks * 2) + 
          (newData.scrolls * 1) + 
          (newData.keyPresses * 3) + 
          (newData.focusTime * 0.1) - 
          (newData.idleTime * 0.2);

        newData.retentionScore = Math.max(0, Math.min(100, 50 + engagementScore * 0.5));

        // Calcul de la charge cognitive
        const activityRate = (newData.clicks + newData.scrolls + newData.keyPresses) / Math.max(newData.timeSpent, 1);
        newData.cognitiveLoad = Math.min(100, activityRate * 10);

        // Déterminer le pattern de lecture
        if (newData.scrolls > newData.clicks * 3) {
          newData.readingPattern = 'scanning';
        } else if (newData.clicks > newData.scrolls * 2) {
          newData.readingPattern = 'focused';
        } else if (scrollBehavior === 'erratic') {
          newData.readingPattern = 'random';
        } else {
          newData.readingPattern = 'linear';
        }

        // Déterminer le niveau d'engagement
        const focusRatio = newData.focusTime / Math.max(newData.timeSpent, 1);
        const activityScore = (newData.clicks + newData.scrolls + newData.keyPresses) / Math.max(newData.timeSpent / 60, 1);
        
        if (focusRatio > 0.9 && activityScore > 20) newData.engagementLevel = 'peak';
        else if (focusRatio > 0.7 && activityScore > 10) newData.engagementLevel = 'high';
        else if (focusRatio > 0.5 && activityScore > 5) newData.engagementLevel = 'medium';
        else newData.engagementLevel = 'low';

        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, lastActivity, scrollBehavior]);

  // Mise à jour du parent
  useEffect(() => {
    onDataUpdate(interactionData);
  }, [interactionData, onDataUpdate]);

  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'peak': return 'text-purple-600 bg-purple-100';
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPatternIcon = (pattern: string) => {
    switch (pattern) {
      case 'linear': return '📖';
      case 'scanning': return '👀';
      case 'focused': return '🎯';
      case 'random': return '🔀';
      default: return '📄';
    }
  };

  return (
    <div className="relative">
      {children}
      
      {/* Dashboard de tracking flottant (peut être masqué) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-4 left-4 z-30"
      >
        <Card className="w-80 bg-white/95 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              Analyse d'Interaction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Métriques principales */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-2 bg-blue-50 rounded">
                <div className="text-lg font-bold text-blue-600">{interactionData.clicks}</div>
                <div className="text-xs text-blue-600">Clics</div>
              </div>
              <div className="p-2 bg-green-50 rounded">
                <div className="text-lg font-bold text-green-600">{Math.floor(interactionData.timeSpent / 60)}m</div>
                <div className="text-xs text-green-600">Temps</div>
              </div>
            </div>

            {/* Niveau d'engagement */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Engagement</span>
              <Badge className={`text-xs ${getEngagementColor(interactionData.engagementLevel)}`}>
                {interactionData.engagementLevel}
              </Badge>
            </div>

            {/* Pattern de lecture */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Pattern</span>
              <div className="flex items-center gap-1">
                <span>{getPatternIcon(interactionData.readingPattern)}</span>
                <span className="text-xs">{interactionData.readingPattern}</span>
              </div>
            </div>

            {/* Score de rétention */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Rétention</span>
                <span className="text-sm font-bold">{Math.round(interactionData.retentionScore)}%</span>
              </div>
              <Progress value={interactionData.retentionScore} className="h-2" />
            </div>

            {/* Charge cognitive */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Charge cognitive</span>
                <span className="text-sm font-bold">{Math.round(interactionData.cognitiveLoad)}%</span>
              </div>
              <Progress value={interactionData.cognitiveLoad} className="h-2" />
            </div>

            {/* Focus vs Idle */}
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Focus: {Math.floor(interactionData.focusTime / 60)}m</span>
              <span>Idle: {Math.floor(interactionData.idleTime / 60)}m</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Indicateur de curseur avancé (mode debug) */}
      {process.env.NODE_ENV === 'development' && (
        <div
          className="fixed pointer-events-none z-50 w-2 h-2 bg-red-500 rounded-full opacity-50"
          style={{
            left: mousePosition.x - 4,
            top: mousePosition.y - 4,
            transition: 'all 0.1s ease-out'
          }}
        />
      )}
    </div>
  );
};
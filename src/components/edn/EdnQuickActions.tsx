import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Zap, Download, Share2, Bookmark, 
  Clock, Sparkles, Target, Users 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const EdnQuickActions = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      id: 'study-mode',
      title: 'Mode Étude Express',
      description: 'Session focalisée de 25 minutes',
      icon: <Clock className="h-5 w-5" />,
      color: 'from-blue-500/20 to-cyan-500/20 border-blue-400/30',
      action: () => navigate('/features')
    },
    {
      id: 'ai-suggestions',
      title: 'Suggestions IA',
      description: 'Recommandations personnalisées',
      icon: <Sparkles className="h-5 w-5" />,
      color: 'from-purple-500/20 to-pink-500/20 border-purple-400/30',
      action: () => console.log('AI suggestions')
    },
    {
      id: 'objectives',
      title: 'Objectifs du Jour',
      description: 'Définir vos priorités',
      icon: <Target className="h-5 w-5" />,
      color: 'from-green-500/20 to-emerald-500/20 border-green-400/30',
      action: () => console.log('Daily objectives')
    },
    {
      id: 'collaborate',
      title: 'Étudier Ensemble',
      description: 'Rejoindre un groupe',
      icon: <Users className="h-5 w-5" />,
      color: 'from-orange-500/20 to-red-500/20 border-orange-400/30',
      action: () => navigate('/med-mng/community')
    }
  ];

  return (
    <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-400" />
          Actions Rapides
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => (
            <Button
              key={action.id}
              variant="ghost"
              className={`h-auto p-4 bg-gradient-to-r ${action.color} hover:scale-105 transition-all duration-300 flex flex-col items-center gap-2`}
              onClick={action.action}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="text-white mb-1">
                {action.icon}
              </div>
              <div className="text-center">
                <div className="text-xs font-medium text-white">
                  {action.title}
                </div>
                <div className="text-xs text-gray-300 mt-1">
                  {action.description}
                </div>
              </div>
            </Button>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" className="flex-1 text-white hover:bg-white/10">
              <Download className="h-3 w-3 mr-1" />
              Exporter
            </Button>
            <Button size="sm" variant="ghost" className="flex-1 text-white hover:bg-white/10">
              <Share2 className="h-3 w-3 mr-1" />
              Partager
            </Button>
            <Button size="sm" variant="ghost" className="flex-1 text-white hover:bg-white/10">
              <Bookmark className="h-3 w-3 mr-1" />
              Sauver
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Music, 
  BookOpen, 
  MessageSquare, 
  Users, 
  BarChart3, 
  Settings, 
  Shield,
  Database,
  HeadphonesIcon,
  FileDown,
  Stethoscope,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';

export const QuickNavigation: React.FC = () => {
  const navigate = useNavigate();

  const navigationItems = [
    {
      title: "Générateur IA",
      description: "Créer des musiques éducatives",
      icon: Music,
      path: "/generator",
      color: "from-blue-500 to-indigo-600",
      iconColor: "text-blue-100"
    },
    {
      title: "Items EDN",
      description: "Base complète IC-1 à IC-367",
      icon: BookOpen,
      path: "/edn",
      color: "from-pink-500 to-purple-600",
      iconColor: "text-pink-100"
    },
    {
      title: "Simulations ECOS",
      description: "Examens Cliniques Objectifs",
      icon: Stethoscope,
      path: "/ecos",
      color: "from-green-500 to-emerald-600",
      iconColor: "text-green-100"
    },
    {
      title: "Assistant IA",
      description: "Chat médical intelligent",
      icon: MessageSquare,
      path: "/chat",
      color: "from-orange-500 to-red-600",
      iconColor: "text-orange-100"
    },
    {
      title: "Analytics",
      description: "Statistiques et performances",
      icon: BarChart3,
      path: "/analytics",
      color: "from-purple-500 to-violet-600",
      iconColor: "text-purple-100"
    },
    {
      title: "Support",
      description: "Aide et documentation",
      icon: HeadphonesIcon,
      path: "/support",
      color: "from-teal-500 to-cyan-600",
      iconColor: "text-teal-100"
    },
    {
      title: "Admin",
      description: "Gestion et supervision",
      icon: Shield,
      path: "/admin",
      color: "from-gray-600 to-gray-700",
      iconColor: "text-gray-100"
    },
    {
      title: "Monitoring",
      description: "Surveillance système",
      icon: Activity,
      path: "/monitoring",
      color: "from-indigo-500 to-blue-600",
      iconColor: "text-indigo-100"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
      {navigationItems.map((item, index) => {
        const IconComponent = item.icon;
        return (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className="group cursor-pointer hover:shadow-2xl transition-all duration-300 bg-black/20 backdrop-blur-xl border border-white/10 hover:border-white/30 overflow-hidden"
              onClick={() => navigate(item.path)}
            >
              <CardContent className="p-4 relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                <div className="relative z-10 text-center space-y-3">
                  <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className={`h-6 w-6 ${item.iconColor}`} />
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-white text-sm group-hover:text-blue-200 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-300 mt-1 leading-tight">
                      {item.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
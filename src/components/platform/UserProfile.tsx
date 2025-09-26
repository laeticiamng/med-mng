import React, { useState } from 'react';
import { User, Settings, LogOut, CreditCard, Bell, HelpCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt sur MED MNG !",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur est survenue lors de la déconnexion.",
        variant: "destructive"
      });
    }
    setIsOpen(false);
  };

  const menuItems = [
    {
      icon: User,
      label: 'Mon profil',
      onClick: () => {
        navigate('/med-mng/profile');
        setIsOpen(false);
      }
    },
    {
      icon: Settings,
      label: 'Paramètres',
      onClick: () => {
        navigate('/med-mng/settings');
        setIsOpen(false);
      }
    },
    {
      icon: CreditCard,
      label: 'Abonnement',
      onClick: () => {
        navigate('/med-mng/pricing');
        setIsOpen(false);
      }
    },
    {
      icon: Bell,
      label: 'Notifications',
      onClick: () => {
        toast({ title: "Centre de notifications", description: "Ouverture des paramètres de notification" });
        setIsOpen(false);
      }
    },
    {
      icon: HelpCircle,
      label: 'Aide & Support',
      onClick: () => {
        navigate('/support');
        setIsOpen(false);
      }
    },
    {
      icon: Shield,
      label: 'Confidentialité',
      onClick: () => {
        navigate('/politique-de-confidentialite');
        setIsOpen(false);
      }
    }
  ];

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/med-mng/login')}
        >
          Se connecter
        </Button>
        <Button
          size="sm"
          onClick={() => navigate('/med-mng/signup')}
        >
          S'inscrire
        </Button>
      </div>
    );
  }

  const userInitials = user.email?.charAt(0).toUpperCase() || 'U';
  const userPlan = 'Premium'; // À remplacer par la vraie donnée
  const userStats = {
    generationsUsed: 47,
    generationsTotal: 100,
    tracksCreated: 23
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.user_metadata?.avatar_url} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        <span className="hidden md:inline">{user.email?.split('@')[0]}</span>
      </Button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-80 z-50">
            <Card className="shadow-lg border-0 bg-background/95 backdrop-blur-sm">
              <CardContent className="p-0">
                {/* Header utilisateur */}
                <div className="p-4 border-b">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">
                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                      </h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {user.email}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs">
                          {userPlan}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistiques rapides */}
                <div className="p-4 border-b bg-muted/30">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-primary">
                        {userStats.generationsUsed}/{userStats.generationsTotal}
                      </div>
                      <div className="text-xs text-muted-foreground">Générations ce mois</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        {userStats.tracksCreated}
                      </div>
                      <div className="text-xs text-muted-foreground">Musiques créées</div>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="p-2">
                  {menuItems.map((item, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start h-10"
                      onClick={item.onClick}
                    >
                      <item.icon className="h-4 w-4 mr-3" />
                      {item.label}
                    </Button>
                  ))}
                  
                  <Separator className="my-2" />
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-10 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Se déconnecter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
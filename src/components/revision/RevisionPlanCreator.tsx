import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Target, 
  Clock, 
  Plus,
  Brain,
  Zap,
  Flame,
  Star
} from 'lucide-react';
import { usePersonalizedRevision } from '@/hooks/usePersonalizedRevision';
import { useToast } from '@/hooks/use-toast';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';

export const RevisionPlanCreator: React.FC = () => {
  const [planName, setPlanName] = useState('');
  const [dailyTarget, setDailyTarget] = useState([5]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const { revisionItems, createRevisionPlan } = usePersonalizedRevision();
  const { toast } = useToast();
  const { logActivity } = useActivityTracking();
  const { stats: gamificationStats, addPoints, loadStats } = useGamification();

  // Check user on mount
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        loadStats(user.id);
      }
    };
    checkUser();
  }, [loadStats]);

  // Grouper les items par priorité
  const highPriorityItems = revisionItems.filter(item => item.priority_score >= 30);
  const mediumPriorityItems = revisionItems.filter(item => item.priority_score >= 15 && item.priority_score < 30);
  const lowPriorityItems = revisionItems.filter(item => item.priority_score < 15);

  const handleItemToggle = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = (items: typeof revisionItems) => {
    const itemIds = items.map(item => item.id);
    setSelectedItems(prev => {
      const allSelected = itemIds.every(id => prev.includes(id));
      if (allSelected) {
        return prev.filter(id => !itemIds.includes(id));
      } else {
        return [...new Set([...prev, ...itemIds])];
      }
    });
  };

  const handleCreatePlan = async () => {
    if (!planName.trim()) {
      toast({
        title: "Nom requis",
        description: "Veuillez donner un nom à votre plan de révision",
        variant: "destructive"
      });
      return;
    }

    if (selectedItems.length === 0) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner au moins un concept à réviser",
        variant: "destructive"
      });
      return;
    }

    setCreating(true);
    try {
      await createRevisionPlan(planName, selectedItems, dailyTarget[0]);
      
      // Track activity and award points
      if (user) {
        await logActivity({
          activity_type: 'study',
          count: 1,
          metadata: { 
            action: 'revision_plan_created',
            planName,
            itemsCount: selectedItems.length,
            dailyTarget: dailyTarget[0]
          }
        });
        await addPoints(user.id, 'dailyStreak');
        loadStats(user.id);
      }
      
      toast({
        title: "Plan créé !",
        description: `Votre plan "${planName}" a été créé avec ${selectedItems.length} concepts`,
        variant: "default"
      });

      // Reset du formulaire
      setPlanName('');
      setSelectedItems([]);
      setDailyTarget([5]);
      
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le plan de révision",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const estimatedDays = selectedItems.length > 0 ? Math.ceil(selectedItems.length / dailyTarget[0]) : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Créer un plan de révision personnalisé
            </CardTitle>
            <CardDescription>
              Basé sur vos erreurs récentes et vos besoins d'apprentissage
            </CardDescription>
          </div>
          
          {/* Gamification Stats */}
          {user && gamificationStats && (
            <div className="flex items-center gap-3 px-3 py-1.5 bg-muted/50 rounded-full">
              <div className="flex items-center gap-1 text-warning">
                <Flame className="h-4 w-4" />
                <span className="font-bold text-sm">{gamificationStats.currentStreak}</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-1 text-primary">
                <Star className="h-4 w-4" />
                <span className="font-bold text-sm">Nv.{gamificationStats.level}</span>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Configuration du plan */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="plan-name">Nom du plan</Label>
            <Input
              id="plan-name"
              placeholder="Ex: Révision Cardiologie, Préparation Examen..."
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label>Objectif quotidien: {dailyTarget[0]} concept(s)/jour</Label>
            <Slider
              value={dailyTarget}
              onValueChange={setDailyTarget}
              max={15}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1/jour</span>
              <span>15/jour</span>
            </div>
          </div>

          {selectedItems.length > 0 && (
            <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
              <div className="flex items-center gap-2 text-primary text-sm">
                <Calendar className="h-4 w-4" />
                <span>Durée estimée: {estimatedDays} jour(s)</span>
                <Target className="h-4 w-4 ml-4" />
                <span>{selectedItems.length} concept(s) sélectionné(s)</span>
              </div>
            </div>
          )}
        </div>

        {/* Sélection des concepts */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Concepts à inclure dans le plan
          </h4>

          {/* Concepts haute priorité */}
          {highPriorityItems.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-xs">Priorité haute</Badge>
                  <span className="text-sm text-muted-foreground">
                    {highPriorityItems.length} concept(s) • Erreurs fréquentes
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleSelectAll(highPriorityItems)}
                >
                  {highPriorityItems.every(item => selectedItems.includes(item.id)) ? 'Désélectionner' : 'Tout sélectionner'}
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-2 pl-4">
                {highPriorityItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={item.id}
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={() => handleItemToggle(item.id)}
                    />
                    <Label 
                      htmlFor={item.id} 
                      className="flex-1 text-sm cursor-pointer flex items-center justify-between"
                    >
                      <span>{item.concept}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {item.item_code}
                        </Badge>
                        <span className="text-xs text-destructive">
                          {item.error_frequency} erreur(s)
                        </span>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Concepts priorité moyenne */}
          {mediumPriorityItems.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-xs">Priorité moyenne</Badge>
                  <span className="text-sm text-muted-foreground">
                    {mediumPriorityItems.length} concept(s) • À consolider
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleSelectAll(mediumPriorityItems)}
                >
                  {mediumPriorityItems.every(item => selectedItems.includes(item.id)) ? 'Désélectionner' : 'Tout sélectionner'}
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-2 pl-4">
                {mediumPriorityItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={item.id}
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={() => handleItemToggle(item.id)}
                    />
                    <Label 
                      htmlFor={item.id} 
                      className="flex-1 text-sm cursor-pointer flex items-center justify-between"
                    >
                      <span>{item.concept}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {item.item_code}
                        </Badge>
                        <span className="text-xs text-warning">
                          {item.error_frequency} erreur(s)
                        </span>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Concepts priorité basse */}
          {lowPriorityItems.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">Priorité basse</Badge>
                  <span className="text-sm text-muted-foreground">
                    {lowPriorityItems.length} concept(s) • Entretien
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleSelectAll(lowPriorityItems)}
                >
                  {lowPriorityItems.every(item => selectedItems.includes(item.id)) ? 'Désélectionner' : 'Tout sélectionner'}
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-2 pl-4">
                {lowPriorityItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={item.id}
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={() => handleItemToggle(item.id)}
                    />
                    <Label 
                      htmlFor={item.id} 
                      className="flex-1 text-sm cursor-pointer flex items-center justify-between"
                    >
                      <span>{item.concept}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {item.item_code}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {item.error_frequency} erreur(s)
                        </span>
                      </div>
                    </Label>
                  </div>
                ))}
                {lowPriorityItems.length > 5 && (
                  <p className="text-xs text-muted-foreground pl-6">
                    +{lowPriorityItems.length - 5} autres concepts
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bouton de création */}
        <Button 
          onClick={handleCreatePlan}
          disabled={creating || !planName.trim() || selectedItems.length === 0}
          className="w-full"
        >
          {creating ? (
            <>
              <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
              Création...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Créer le plan de révision
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
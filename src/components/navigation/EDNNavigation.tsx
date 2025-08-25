import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, BookOpen, Heart, Brain, Baby, Eye, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EDNNavigation = () => {
  const [openModules, setOpenModules] = useState<string[]>([]);

  const toggleModule = (moduleId: string) => {
    setOpenModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const ednModules = [
    {
      id: 'fundamentals',
      title: 'Fondamentaux médicaux',
      description: 'Items 1-10 - Bases essentielles',
      icon: BookOpen,
      color: 'bg-blue-500',
      items: [
        { code: 'IC-1', title: 'Communication médecin-patient', rang: 'A/B' },
        { code: 'IC-2', title: 'Valeurs professionnelles', rang: 'A' },
        { code: 'IC-3', title: 'Raisonnement clinique', rang: 'A/B' },
        { code: 'IC-4', title: 'Sécurité des soins', rang: 'A' }
      ]
    },
    {
      id: 'cardiology',
      title: 'Cardiologie',
      description: 'Items 221-239 - Pathologies cardiovasculaires',
      icon: Heart,
      color: 'bg-red-500',
      items: [
        { code: 'IC-221', title: 'Hypertension artérielle', rang: 'A/B' },
        { code: 'IC-222', title: 'Dyslipidémies', rang: 'A' },
        { code: 'IC-223', title: 'Athérosclérose', rang: 'A/B' },
        { code: 'IC-224', title: 'Insuffisance cardiaque', rang: 'A/B' }
      ]
    },
    {
      id: 'neurology',
      title: 'Neurologie',
      description: 'Items 91-110 - Système nerveux',
      icon: Brain,
      color: 'bg-purple-500',
      items: [
        { code: 'IC-91', title: 'Déficit neurologique récent', rang: 'A/B' },
        { code: 'IC-92', title: 'Céphalées chroniques', rang: 'A' },
        { code: 'IC-93', title: 'Épilepsie', rang: 'A/B' },
        { code: 'IC-94', title: 'Maladie de Parkinson', rang: 'B' }
      ]
    },
    {
      id: 'pediatrics',
      title: 'Pédiatrie',
      description: 'Items 47-57 - Médecine de l\'enfant',
      icon: Baby,
      color: 'bg-green-500',
      items: [
        { code: 'IC-47', title: 'Développement psychomoteur', rang: 'A' },
        { code: 'IC-48', title: 'Alimentation du nourrisson', rang: 'A' },
        { code: 'IC-49', title: 'Troubles du sommeil', rang: 'A/B' },
        { code: 'IC-50', title: 'Fièvre chez l\'enfant', rang: 'A/B' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Items EDN - Exploration par spécialités
        </h1>
        <p className="text-muted-foreground">
          Accédez aux 367 items de connaissances médicales organisés par domaines
        </p>
      </div>

      <div className="grid gap-4">
        {ednModules.map((module) => (
          <Card key={module.id} className="border-2 hover:shadow-lg transition-all">
            <Collapsible 
              open={openModules.includes(module.id)}
              onOpenChange={() => toggleModule(module.id)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 ${module.color} rounded-lg`}>
                        <module.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left">
                        <CardTitle className="flex items-center gap-2">
                          {module.title}
                          <Badge variant="secondary">{module.items.length} items</Badge>
                        </CardTitle>
                        <CardDescription>{module.description}</CardDescription>
                      </div>
                    </div>
                    {openModules.includes(module.id) ? 
                      <ChevronDown className="h-5 w-5" /> : 
                      <ChevronRight className="h-5 w-5" />
                    }
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="grid gap-3">
                    {module.items.map((item) => (
                      <Link key={item.code} to={`/edn/item/${item.code.toLowerCase()}`}>
                        <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="font-mono text-xs">
                              {item.code}
                            </Badge>
                            <span className="font-medium">{item.title}</span>
                          </div>
                          <Badge 
                            variant={item.rang.includes('B') ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            Rang {item.rang}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                    <Link to={`/edn/specialty/${module.id}`}>
                      <Button variant="outline" className="w-full mt-2">
                        Voir tous les items {module.title}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>
    </div>
  );
};
/**
 * Guide des coûts et quotas API
 * Informe les utilisateurs sur les services payants et leur gestion
 */

import React, { useState } from 'react';
import { 
  DollarSign, 
  AlertTriangle, 
  TrendingUp, 
  Info,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Zap,
  Music,
  MessageSquare,
  Search,
  CreditCard
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

interface APIService {
  name: string;
  icon: React.ReactNode;
  description: string;
  pricing: string;
  costLevel: 'low' | 'medium' | 'high';
  features: string[];
  tips: string[];
  alternatives?: string;
}

const API_SERVICES: APIService[] = [
  {
    name: 'OpenAI (GPT-4)',
    icon: <MessageSquare className="h-5 w-5" />,
    description: 'Assistant IA médical, génération de quiz et résumés',
    pricing: '~$0.03-0.12 / 1K tokens',
    costLevel: 'high',
    features: [
      'Chat médical intelligent',
      'Génération de cas cliniques',
      'Résumés automatiques',
      'Quiz personnalisés'
    ],
    tips: [
      'Limitez les conversations longues',
      'Utilisez les réponses courtes quand possible',
      'Évitez de régénérer plusieurs fois'
    ],
    alternatives: 'Llama 3, Mistral (open-source, à venir)'
  },
  {
    name: 'Suno (Musique IA)',
    icon: <Music className="h-5 w-5" />,
    description: 'Génération de chansons médicales personnalisées',
    pricing: '~50 crédits/chanson (abonnement)',
    costLevel: 'medium',
    features: [
      'Chansons sur items EDN',
      'Styles musicaux variés',
      'Paroles personnalisées',
      'Qualité audio haute définition'
    ],
    tips: [
      'Vérifiez vos crédits avant génération',
      'Évitez les régénérations multiples',
      'Téléchargez vos chansons favorites'
    ]
  },
  {
    name: 'Perplexity',
    icon: <Search className="h-5 w-5" />,
    description: 'Recherche web augmentée et sources médicales',
    pricing: '~$0.005 / requête',
    costLevel: 'low',
    features: [
      'Recherche de guidelines récentes',
      'Sources médicales vérifiées',
      'Actualités médicales'
    ],
    tips: [
      'Utilisez pour des recherches ciblées',
      'Préférez les requêtes précises'
    ],
    alternatives: 'Recherche manuelle sur PubMed, HAS'
  },
  {
    name: 'Firecrawl',
    icon: <Zap className="h-5 w-5" />,
    description: 'Extraction automatique de contenus web médicaux',
    pricing: '~$0.01 / page',
    costLevel: 'low',
    features: [
      'Extraction de guidelines',
      'Mise à jour automatique des contenus',
      'Scraping éthique'
    ],
    tips: [
      'Limiter aux sources officielles',
      'Planifier les mises à jour'
    ]
  },
  {
    name: 'Stripe',
    icon: <CreditCard className="h-5 w-5" />,
    description: 'Gestion des paiements et abonnements',
    pricing: '2.9% + 0.30€ / transaction',
    costLevel: 'medium',
    features: [
      'Paiements sécurisés',
      'Abonnements récurrents',
      'Facturation automatique'
    ],
    tips: [
      'Vérifiez votre facture mensuelle',
      'Annulez avant renouvellement si nécessaire'
    ]
  }
];

const getCostBadge = (level: 'low' | 'medium' | 'high') => {
  const config = {
    low: { label: 'Coût faible', variant: 'secondary' as const, className: 'bg-success/10 text-success border-success/20' },
    medium: { label: 'Coût modéré', variant: 'secondary' as const, className: 'bg-warning/10 text-warning-foreground border-warning/20' },
    high: { label: 'Coût élevé', variant: 'destructive' as const, className: 'bg-destructive/10 text-destructive border-destructive/20' }
  };
  return config[level];
};

interface APICostsGuideProps {
  className?: string;
  compact?: boolean;
}

export const APICostsGuide: React.FC<APICostsGuideProps> = ({ 
  className,
  compact = false 
}) => {
  const [showDetails, setShowDetails] = useState(!compact);

  return (
    <Card className={cn("border-border", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Guide des Coûts API</CardTitle>
          </div>
          {compact && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        <CardDescription>
          Comprendre et gérer les coûts des services externes
        </CardDescription>
      </CardHeader>

      {showDetails && (
        <CardContent className="space-y-4">
          {/* Avertissement */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Transparence sur les coûts</AlertTitle>
            <AlertDescription className="text-sm">
              MED-MNG utilise des APIs externes payantes. Les fonctionnalités IA 
              (chat, génération musicale) consomment des crédits. Surveillez votre 
              utilisation pour éviter les surprises.
            </AlertDescription>
          </Alert>

          {/* Estimation mensuelle */}
          <Card className="bg-muted/30 border-muted">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Estimation utilisation typique</span>
                <Badge variant="outline">Utilisateur actif</Badge>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>• 50 conversations IA/mois</span>
                  <span>~$2-5</span>
                </div>
                <div className="flex justify-between">
                  <span>• 10 chansons générées/mois</span>
                  <span>~$5-10 (crédits Suno)</span>
                </div>
                <div className="flex justify-between">
                  <span>• Recherches Perplexity</span>
                  <span>~$1-2</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-medium text-foreground">
                  <span>Total estimé</span>
                  <span>~$8-17/mois</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des services */}
          <Accordion type="single" collapsible className="w-full">
            {API_SERVICES.map((service, index) => {
              const costBadge = getCostBadge(service.costLevel);
              
              return (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {service.icon}
                      </div>
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {service.pricing}
                        </div>
                      </div>
                      <Badge className={cn("ml-auto mr-2", costBadge.className)}>
                        {costBadge.label}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-12 space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {service.description}
                      </p>
                      
                      <div>
                        <h5 className="text-xs font-medium uppercase text-muted-foreground mb-1">
                          Fonctionnalités
                        </h5>
                        <ul className="text-sm space-y-1">
                          {service.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="w-1 h-1 rounded-full bg-primary" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h5 className="text-xs font-medium uppercase text-muted-foreground mb-1">
                          💡 Conseils pour économiser
                        </h5>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          {service.tips.map((tip, i) => (
                            <li key={i}>• {tip}</li>
                          ))}
                        </ul>
                      </div>

                      {service.alternatives && (
                        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                          <strong>Alternative envisagée :</strong> {service.alternatives}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/pricing" className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Voir les forfaits
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a 
                href="https://docs.med-mng.com/costs" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Documentation complète
              </a>
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default APICostsGuide;

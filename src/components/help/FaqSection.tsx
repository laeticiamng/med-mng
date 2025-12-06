import React from 'react';
import { Link } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, BookOpen, Music, Brain, Zap } from "lucide-react";
import { ROUTE_PATHS } from '@/config/routes';
const faqItems = [
  {
    id: "rang-ab",
    question: "Quelle est la différence entre Rang A et Rang B ?",
    answer: (
      <div className="space-y-3">
        <div className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg">
          <BookOpen className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground mb-1">Rang A - Fondamentaux</p>
            <p className="text-sm text-muted-foreground">
              Connaissances de base essentielles que tout étudiant en médecine doit maîtriser. 
              Correspond aux objectifs du tronc commun de formation.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-accent/10 rounded-lg">
          <Brain className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground mb-1">Rang B - Expertise Avancée</p>
            <p className="text-sm text-muted-foreground">
              Connaissances approfondies pour cas complexes et situations exceptionnelles. 
              Destiné aux étudiants avancés et internes.
            </p>
          </div>
        </div>
      </div>
    ),
    category: "Général",
    icon: HelpCircle
  },
  {
    id: "competences-oic",
    question: "Que sont les compétences OIC ?",
    answer: (
      <div className="space-y-2">
        <p className="text-sm">
          Les <strong>Objectifs d'Item et de Compétences (OIC)</strong> sont les compétences officielles 
          définies par l'UNESS (Université Numérique en Santé et Sport).
        </p>
        <p className="text-sm">
          Chaque item EDN est associé à des objectifs précis que vous devez maîtriser pour l'ECN. 
          Notre plateforme intègre automatiquement ces 4872 compétences officielles.
        </p>
        <Badge variant="outline" className="mt-2">
          Source : Référentiel UNESS 2024-2025
        </Badge>
      </div>
    ),
    category: "Contenu",
    icon: BookOpen
  },
  {
    id: "musiques-ia",
    question: "Comment fonctionnent les musiques mnémotechniques IA ?",
    answer: (
      <div className="space-y-2">
        <p className="text-sm">
          Les musiques sont générées par IA (Suno) pour vous aider à mémoriser les concepts clés 
          de chaque item EDN grâce à la mnémotechnie musicale.
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm ml-2">
          <li>Paroles personnalisées basées sur les compétences OIC</li>
          <li>Styles musicaux variés pour maintenir l'attention</li>
          <li>Téléchargeables pour révision offline</li>
        </ul>
        <div className="flex items-center gap-2 mt-3 p-2 bg-warning/10 rounded">
          <Zap className="w-4 h-4 text-warning" />
          <p className="text-xs text-muted-foreground">
            <strong>Gratuit</strong> : Consultez les paroles sans limite. 
            <strong>Crédits</strong> : Uniquement pour générer l'audio.
          </p>
        </div>
      </div>
    ),
    category: "Musiques",
    icon: Music
  },
  {
    id: "credits",
    question: "À quoi servent les crédits ?",
    answer: (
      <div className="space-y-3">
        <div className="p-3 bg-success/10 rounded-lg border border-success/20">
          <p className="text-sm font-semibold text-foreground mb-2">
            ✅ GRATUIT illimité
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
            <li>Consulter les 367 items EDN</li>
            <li>Lire tout le contenu (Rang A + B)</li>
            <li>Faire tous les quiz</li>
            <li>Lire les paroles musicales</li>
          </ul>
        </div>
        <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-sm font-semibold text-foreground mb-2">
            🎵 Avec crédits (80/160 offerts)
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
            <li>Générer des musiques IA personnalisées</li>
            <li>Télécharger les fichiers audio</li>
          </ul>
        </div>
      </div>
    ),
    category: "Crédits",
    icon: Zap
  },
  {
    id: "rubriques",
    question: "Que signifient les rubriques médicales ?",
    answer: (
      <div className="space-y-2">
        <p className="text-sm">
          Les <strong>rubriques</strong> sont des catégories thématiques qui organisent 
          les compétences par domaine médical.
        </p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <Badge variant="outline">Communication Médicale</Badge>
          <Badge variant="outline">Éthique & Relation</Badge>
          <Badge variant="outline">Diagnostic & Clinique</Badge>
          <Badge variant="outline">Thérapeutique</Badge>
          <Badge variant="outline">Urgences</Badge>
          <Badge variant="outline">Santé Publique</Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Ces rubriques facilitent la révision ciblée par thème médical.
        </p>
      </div>
    ),
    category: "Contenu",
    icon: BookOpen
  }
];

export const FaqSection: React.FC = () => {
  const categories = [...new Set(faqItems.map(item => item.category))];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold">Questions Fréquentes</div>
            <div className="text-sm text-muted-foreground font-normal">
              Tout ce que vous devez savoir sur la plateforme
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <IconComponent className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-semibold">{item.question}</div>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-8 pt-2">
                    {item.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground text-center">
            Vous avez une autre question ? 
            <Link to={ROUTE_PATHS.chat} className="text-primary font-medium ml-1 hover:underline">
              Contactez l'Assistant IA
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

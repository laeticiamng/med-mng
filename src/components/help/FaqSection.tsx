import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTE_PATHS } from '@/config/routes';
import { BookOpen, Brain, HelpCircle, Music, Zap } from "lucide-react";
import React from 'react';
import { Link } from 'react-router-dom';
import { PROMESSE_AUDIO } from '@/config/offre';
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
              Connaissances indispensables que tout futur médecin doit maîtriser,
              quelle que soit sa spécialité.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-accent/10 rounded-lg">
          <Brain className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground mb-1">Rang B - Approfondissement</p>
            <p className="text-sm text-muted-foreground">
              Connaissances plus approfondies, à travailler après le rang A.
              Un même item contient des connaissances des deux rangs.
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
          Chaque item EDN est associé à des objectifs précis, répartis en rang A et rang B.
          Med MNG les affiche item par item, tels qu'ils figurent dans le référentiel.
        </p>
        <Badge variant="outline" className="mt-2">
          Source : référentiel LiSA (UNESS)
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
          Les paroles sont rédigées par IA à partir des compétences de chaque item ; l'audio
          est ensuite généré par IA. La chanson complète le quiz et vos cours, elle ne les remplace pas.
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm ml-2">
          <li>Paroles personnalisées basées sur les compétences OIC</li>
          <li>Styles musicaux variés pour maintenir l'attention</li>
                  </ul>
        <div className="flex items-center gap-2 mt-3 p-2 bg-warning/10 rounded">
          <Zap className="w-4 h-4 text-warning" />
          <p className="text-xs text-muted-foreground">
            <strong>Gratuit</strong> : 10 items d'essai complets.
            <strong>Premium</strong> : les 367 items et {PROMESSE_AUDIO}.
          </p>
        </div>
      </div>
    ),
    category: "Musiques",
    icon: Music
  },
  {
    id: "credits",
    question: "Qu'est-ce qui est gratuit, qu'est-ce qui est Premium ?",
    answer: (
      <div className="space-y-3">
        <div className="p-3 bg-success/10 rounded-lg border border-success/20">
          <p className="text-sm font-semibold text-foreground mb-2">
            Gratuit
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
            <li>Les fiches des 367 items (compétences rang A et rang B)</li>
            <li>Le contenu complet de 10 items d'essai (paroles, récit, planches, quiz)</li>
            <li>Les situations ECOS</li>
          </ul>
        </div>
        <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-sm font-semibold text-foreground mb-2">
            Med MNG Premium (69 € par an ou 9,90 € par mois)
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
            <li>Le contenu immersif des 367 items</li>
            <li>{PROMESSE_AUDIO.charAt(0).toUpperCase() + PROMESSE_AUDIO.slice(1)}</li>
          </ul>
        </div>
      </div>
    ),
    category: "Tarifs",
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
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center">
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
            <Link to={ROUTE_PATHS.faq} className="text-primary font-medium ml-1 underline underline-offset-2 hover:decoration-2">
              Consultez la FAQ
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

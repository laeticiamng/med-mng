import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "Qu'est-ce qui est gratuit ?",
    answer: "Les 367 items EDN (fiche, rang A, rang B, quiz), les paroles de chanson de chaque item et les situations ECOS sont accessibles avec un compte gratuit. Le compte gratuit inclut aussi 3 générations audio offertes."
  },
  {
    question: "Quelle est la différence entre Standard, Pro et Premium ?",
    answer: "Les trois formules donnent accès aux mêmes contenus. Elles diffèrent par le nombre de chansons audio que vous pouvez générer chaque mois : 30 (Standard, 19€), 300 (Pro, 29€) ou 3 000 (Premium, 39€)."
  },
  {
    question: "Comment fonctionne le droit de rétractation ?",
    answer: "Vous disposez de 14 jours pour vous rétracter, sauf si vous avez utilisé des crédits de génération. Dans ce cas, le service est considéré comme consommé. Voir les CGV."
  },
  {
    question: "Puis-je annuler mon abonnement ?",
    answer: "Oui, depuis votre profil. Vous conservez l'accès jusqu'à la fin de la période payée. Aucun engagement."
  },
  {
    question: "Sur quoi repose le contenu ?",
    answer: "Les compétences de chaque item (rang A et rang B) proviennent du référentiel public UNESS/LiSA. MED-MNG n'a aucun partenariat officiel avec l'UNESS ni le CNG. Les paroles et quiz sont générés par IA et doivent être vérifiés avec vos sources officielles."
  },
  {
    question: "Puis-je utiliser MED-MNG sur mobile ?",
    answer: "Oui, MED-MNG est une application web progressive (PWA) utilisable sur ordinateur, tablette et smartphone. Installez-la directement depuis votre navigateur."
  },
  {
    question: "Comment fonctionne la musique IA pour réviser ?",
    answer: "Pour chaque item, l'IA rédige des paroles à partir des compétences rang A, rang B ou A+B. Vous pouvez ensuite générer l'audio de la chanson depuis votre compte, dans la limite de vos crédits."
  },
  {
    question: "Mes données sont-elles sécurisées ?",
    answer: "Les données sont hébergées en Europe (RGPD) et ne sont jamais vendues. Vous pouvez les exporter ou les supprimer à tout moment."
  },
  {
    question: "Y a-t-il un support en cas de problème ?",
    answer: "Oui, écrivez à contact@emotionscare.com."
  },
  {
    question: "Puis-je accéder à MED-MNG hors connexion ?",
    answer: "Les fiches déjà consultées restent lisibles hors connexion grâce à la PWA. L'audio, les quiz et la génération nécessitent une connexion internet."
  }
];

export function PricingFAQ() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          Questions fréquentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}

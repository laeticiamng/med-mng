import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "Qu'est-ce qui est gratuit ?",
    answer: "Avec un compte gratuit : les fiches officielles des 367 items (compétences rang A et rang B, référentiel LiSA 2026), le contenu immersif complet (paroles, récit, planches, quiz) de 10 items d'essai, et les situations ECOS."
  },
  {
    question: "Que contient Med MNG Premium ?",
    answer: "Le contenu immersif des 367 items (paroles rang A, rang B et A+B, récit, planches, quiz) et 30 générations audio de chansons par mois. Deux formules : 69 € par an (environ 5,75 € par mois) ou 9,90 € par mois. Il n'y a pas de période d'essai payante : les 10 items d'essai sont ouverts à tous."
  },
  {
    question: "Comment fonctionne le droit de rétractation ?",
    answer: "Le contenu est accessible dès le paiement. Avant de payer, vous demandez expressément cet accès immédiat et reconnaissez perdre votre droit de rétractation dès cet accès (case à cocher). Voir les CGV."
  },
  {
    question: "Puis-je résilier mon abonnement ?",
    answer: "Oui, à tout moment depuis votre profil (« Gérer / résilier mon abonnement »). La résiliation arrête le renouvellement : vous conservez l'accès jusqu'à la fin de la période déjà payée (l'année ou le mois en cours)."
  },
  {
    question: "Sur quoi repose le contenu ?",
    answer: "Les compétences de chaque item (rang A et rang B) proviennent du référentiel public UNESS/LiSA. Med MNG n'a aucun partenariat officiel avec l'UNESS ni le CNG. Les paroles et quiz sont générés par IA et doivent être vérifiés avec vos sources officielles."
  },
  {
    question: "Puis-je utiliser Med MNG sur mobile ?",
    answer: "Oui, Med MNG est une application web progressive (PWA) utilisable sur ordinateur, tablette et smartphone. Installez-la directement depuis votre navigateur."
  },
  {
    question: "Comment fonctionne la musique IA pour réviser ?",
    answer: "Pour chaque item, l'IA rédige des paroles à partir des compétences rang A, rang B ou A+B. Avec Med MNG Premium, vous pouvez ensuite générer l'audio de la chanson (30 générations par mois)."
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
    question: "Puis-je accéder à Med MNG hors connexion ?",
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

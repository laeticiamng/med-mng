import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "Comment fonctionne l'essai gratuit de 7 jours ?",
    answer: "Inscrivez-vous au plan Pro Étudiant et profitez de 7 jours gratuits. Aucun prélèvement avant la fin de l'essai. Annulez à tout moment en 1 clic."
  },
  {
    question: "Puis-je changer de plan à tout moment ?",
    answer: "Oui, vous pouvez upgrader ou downgrader votre abonnement à tout moment. Le changement prend effet immédiatement, calculé au prorata."
  },
  {
    question: "Quelle est la différence entre Pro et Premium ?",
    answer: "Le plan Pro donne accès à tout le contenu EDN, ECOS, cas cliniques et musique IA. Le plan Premium ajoute l'IA avancée, le planning personnalisé, le percentile national simulé et le support VIP."
  },
  {
    question: "Comment fonctionne le droit de rétractation ?",
    answer: "Vous disposez de 14 jours pour vous rétracter, sauf si vous avez utilisé des crédits de génération. Dans ce cas, le service est considéré comme consommé."
  },
  {
    question: "Puis-je annuler mon abonnement ?",
    answer: "Oui, annulation en 1 clic depuis votre profil. Vous conservez l'accès jusqu'à la fin de la période payée. Aucun engagement."
  },
  {
    question: "Le pack 6 mois est-il remboursable ?",
    answer: "Le pack 6 mois Pro à 99€ bénéficie du même droit de rétractation de 14 jours. Après cette période, il n'est pas remboursable mais vous conservez l'accès pendant 6 mois."
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

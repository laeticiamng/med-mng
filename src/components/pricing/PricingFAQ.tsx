import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "Puis-je changer de plan à tout moment ?",
    answer: "Oui, vous pouvez upgrader ou downgrader votre abonnement à tout moment. Le changement prendra effet immédiatement et sera calculé au prorata."
  },
  {
    question: "Que se passe-t-il si j'atteins ma limite de génération ?",
    answer: "Vous serez notifié avant d'atteindre votre limite. Vous pouvez soit attendre le renouvellement mensuel, soit passer à un plan supérieur pour générer plus de contenu."
  },
  {
    question: "Les chansons générées sont-elles téléchargeables ?",
    answer: "Non, pour protéger les droits d'auteur et la qualité, toutes les chansons sont en streaming sécurisé uniquement. Elles restent accessibles dans votre bibliothèque."
  },
  {
    question: "Comment fonctionne le droit de rétractation ?",
    answer: "Vous disposez de 14 jours pour vous rétracter, sauf si vous avez utilisé des crédits de génération. Dans ce cas, le service est considéré comme consommé."
  },
  {
    question: "Puis-je annuler mon abonnement ?",
    answer: "Oui, vous pouvez annuler à tout moment depuis votre profil. Vous conserverez l'accès jusqu'à la fin de la période payée."
  },
  {
    question: "Y a-t-il un engagement minimum ?",
    answer: "Non, aucun engagement ! Tous nos plans sont mensuels sans engagement de durée."
  }
];

export function PricingFAQ() {
  return (
    <Card className="mt-12">
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

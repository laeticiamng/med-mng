import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "Comment fonctionne l'essai gratuit de 7 jours ?",
    answer: "Inscrivez-vous au plan Pro Étudiant et profitez de 7 jours gratuits. Aucun prélèvement avant la fin de l'essai. Annulez à tout moment en 1 clic depuis votre profil."
  },
  {
    question: "Puis-je changer de plan à tout moment ?",
    answer: "Oui, vous pouvez upgrader ou downgrader votre abonnement à tout moment. Le changement prend effet immédiatement, calculé au prorata."
  },
  {
    question: "Quelle est la différence entre Pro et Premium ?",
    answer: "Le plan Pro donne accès à tout le contenu EDN (367 items), ECOS, cas cliniques et musique IA. Le plan Premium ajoute l'IA avancée, le planning personnalisé, le percentile national simulé et le support VIP."
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
  },
  {
    question: "MED-MNG est-il adapté à la réforme R2C ?",
    answer: "Oui, tout le contenu est aligné sur le programme R2C officiel avec les 367 items EDN, les rangs A et B, et les grilles ECOS conformes aux standards UNESS."
  },
  {
    question: "Combien de temps faut-il pour voir des résultats ?",
    answer: "La plupart des étudiants constatent une amélioration de leurs scores dès les 2 premières semaines. Le percentile national simulé vous permet de suivre votre progression en temps réel."
  },
  {
    question: "Puis-je utiliser MED-MNG sur mobile ?",
    answer: "Oui, MED-MNG est une application web progressive (PWA) utilisable sur tous les appareils : ordinateur, tablette et smartphone. Installez-la directement depuis votre navigateur."
  },
  {
    question: "Comment fonctionne la musique IA pour réviser ?",
    answer: "Notre IA génère des chansons médicales personnalisées à partir des items EDN. Chaque chanson est un moyen mnémotechnique unique pour ancrer les connaissances essentielles."
  },
  {
    question: "Les QCM sont-ils conformes à l'EDN ?",
    answer: "Oui, nos QCM sont construits selon le format officiel de l'EDN avec des questions à choix unique et multiple, classées par item et par rang (A et B)."
  },
  {
    question: "Que contiennent les cas cliniques ?",
    answer: "Chaque cas clinique comprend une présentation patient réaliste, des étapes de raisonnement clinique, une correction détaillée et un score par compétence ECOS."
  },
  {
    question: "Mes données sont-elles sécurisées ?",
    answer: "Oui, toutes les données sont chiffrées et hébergées en Europe (RGPD). Vos données personnelles ne sont jamais partagées avec des tiers. Vous pouvez les exporter ou les supprimer à tout moment."
  },
  {
    question: "Y a-t-il un support en cas de problème ?",
    answer: "Les utilisateurs Pro bénéficient d'un support email prioritaire. Les utilisateurs Premium ont accès au support VIP avec réponse sous 24h."
  },
  {
    question: "Comment fonctionne le percentile national simulé ?",
    answer: "Après chaque examen blanc, votre score est comparé à l'ensemble des utilisateurs de la plateforme. Vous obtenez un rang simulé (top 10%, top 25%, etc.) pour évaluer votre niveau."
  },
  {
    question: "Puis-je accéder à MED-MNG hors connexion ?",
    answer: "Certaines fonctionnalités sont disponibles hors ligne grâce à la technologie PWA : fiches de révision, flashcards déjà chargées. Les examens et la génération musicale nécessitent une connexion internet."
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

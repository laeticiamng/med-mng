import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Marie L.",
    role: "D4 Médecine",
    content: "Les chansons m'aident vraiment à retenir les listes de critères diagnostiques. Je les écoute en courant !",
    rating: 5,
    initials: "ML"
  },
  {
    name: "Thomas K.",
    role: "Interne Cardiologie",
    content: "Excellent complément aux fiches de révision. L'approche musicale est vraiment innovante.",
    rating: 5,
    initials: "TK"
  },
  {
    name: "Sophie D.",
    role: "Externe D3",
    content: "J'ai amélioré mes notes en cardio grâce aux paroles mnémotechniques. Je recommande !",
    rating: 4,
    initials: "SD"
  }
];

export function PricingTestimonials() {
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-center mb-2">Ce que disent nos bêta-testeurs</h2>
      <p className="text-sm text-muted-foreground text-center mb-8">Retours basés sur notre phase de test</p>
      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full bg-card/50 hover:bg-card transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < testimonial.rating 
                          ? "text-warning fill-warning" 
                          : "text-muted"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

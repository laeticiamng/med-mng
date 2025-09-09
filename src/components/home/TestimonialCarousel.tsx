import React, { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Quote, Heart } from 'lucide-react';

const TestimonialCarousel: React.FC = () => {
  const testimonials = [
    {
      name: 'Sarah Martin',
      role: 'Étudiante M6 - Cardiologie',
      content: 'MED-MNG a révolutionné ma préparation aux ECN ! L\'IA musicale m\'a permis de mémoriser des concepts complexes.',
      rating: 5
    },
    {
      name: 'Thomas Dubois', 
      role: 'Interne - Urgences',
      content: 'Les scènes immersives EDN m\'ont parfaitement préparé aux situations d\'urgence. Un outil indispensable !',
      rating: 5
    },
    {
      name: 'Dr. Marie Chen',
      role: 'Chef de clinique',
      content: 'J\'utilise MED-MNG pour former mes internes. La qualité pédagogique est exceptionnelle.',
      rating: 5
    }
  ];

  return (
    <section className="medical-section bg-gradient-to-br from-muted/20 to-background">
      <div className="medical-container">
        <motion.div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Heart className="w-4 h-4 mr-2" />
            Témoignages Étudiants
          </Badge>
          <h2 className="text-4xl font-bold mb-6">Ils Ont Révolutionné Leur Apprentissage</h2>
          <p className="text-xl text-muted-foreground">
            Découvrez comment MED-MNG transforme la vie de milliers d'étudiants
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <Quote className="w-8 h-8 text-primary/20 mb-4" />
                  <blockquote className="text-lg mb-6 italic">
                    "{testimonial.content}"
                  </blockquote>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <h4 className="font-bold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default memo(TestimonialCarousel);
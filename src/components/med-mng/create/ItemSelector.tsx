import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Brain, Shield, Building2, Settings, Scale, AlertTriangle, FileText, Microscope } from 'lucide-react';

interface ItemSelectorProps {
  selectedItem: string | null;
  onItemSelect: (itemCode: string) => void;
}

interface EDNItem {
  code: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
}

const EDN_ITEMS = [
  {
    code: 'IC-1',
    title: 'La relation médecin-malade dans le cadre du colloque singulier ou au sein d\'une équipe',
    subtitle: 'Fondements de la relation thérapeutique',
    icon: Users,
    color: 'bg-primary',
    description: 'Communication, empathie et établissement de la confiance dans la relation soignant-soigné.'
  },
  {
    code: 'IC-2',
    title: 'Les valeurs professionnelles du médecin et des autres professions de santé',
    subtitle: 'Éthique et déontologie médicale',
    icon: Shield,
    color: 'bg-success',
    description: 'Principes éthiques, déontologie et responsabilités professionnelles.'
  },
  {
    code: 'IC-3',
    title: 'Le raisonnement et la décision en médecine',
    subtitle: 'Démarche diagnostique et thérapeutique',
    icon: Brain,
    color: 'bg-accent',
    description: 'Processus de raisonnement clinique, prise de décision et gestion de l\'incertitude.'
  },
  {
    code: 'IC-4',
    title: 'La sécurité du patient. La gestion des risques',
    subtitle: 'Qualité et sécurité des soins',
    icon: Shield,
    color: 'bg-destructive',
    description: 'Prévention des erreurs, gestion des risques et amélioration continue de la qualité.'
  },
  {
    code: 'IC-5',
    title: 'L\'annonce d\'une maladie grave ou létale ou d\'un dommage associé aux soins',
    subtitle: 'Communication difficile et accompagnement',
    icon: BookOpen,
    color: 'bg-warning',
    description: 'Techniques d\'annonce, accompagnement psychologique et gestion des émotions.'
  },
  {
    code: 'IC-6',
    title: 'Organisation de l\'exercice clinique et sécurisation du parcours patient',
    subtitle: 'Coordination des soins et continuité',
    icon: Settings,
    color: 'bg-primary/80',
    description: 'Organisation des soins, coordination interprofessionnelle et sécurisation du parcours.'
  },
  {
    code: 'IC-7',
    title: 'Les droits individuels et collectifs du patient',
    subtitle: 'Respect et protection des droits',
    icon: Scale,
    color: 'bg-success/80',
    description: 'Droits des patients, consentement éclairé et médiation en santé.'
  },
  {
    code: 'IC-8',
    title: 'Les discriminations',
    subtitle: 'Identification et lutte anti-discrimination',
    icon: AlertTriangle,
    color: 'bg-warning/80',
    description: 'Reconnaissance des discriminations, prévention et intervention active.'
  },
  {
    code: 'IC-9',
    title: 'Certificats médicaux dans le cadre des violences',
    subtitle: 'Expertise médico-légale et protection',
    icon: FileText,
    color: 'bg-accent/80',
    description: 'Rédaction de certificats, accompagnement des victimes et expertise légale.'
  },
  {
    code: 'IC-10',
    title: 'Approches transversales du corps',
    subtitle: 'Vision holistique et multidimensionnelle',
    icon: Microscope,
    color: 'bg-muted-foreground',
    description: 'Approches intégratives du corps, dimensions psychosomatiques et transversalité.'
  },
  {
    code: 'OIC-010-03-B',
    title: 'Impact des différentes maladies sur l\'expérience du corps',
    subtitle: 'Expérience corporelle et maladie',
    icon: Brain,
    color: 'bg-primary/60',
    description: 'Impact psychocorporel des maladies, adaptation et accompagnement.'
  }
];

export const ItemSelector: React.FC<ItemSelectorProps> = ({ selectedItem, onItemSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {EDN_ITEMS.map((item) => (
        <Card
          key={item.code}
          className={`hover:shadow-lg transition-shadow duration-300 cursor-pointer ${
            selectedItem === item.code ? 'border-2 border-primary' : ''
          }`}
          onClick={() => onItemSelect(item.code)}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <item.icon className="h-5 w-5 text-muted-foreground" />
              {item.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{item.description}</p>
            <Badge className="mt-2" variant="secondary">{item.subtitle}</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

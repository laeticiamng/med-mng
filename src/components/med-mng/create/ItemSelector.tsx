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
    color: 'bg-blue-500',
    description: 'Communication, empathie et établissement de la confiance dans la relation soignant-soigné.'
  },
  {
    code: 'IC-2',
    title: 'Les valeurs professionnelles du médecin et des autres professions de santé',
    subtitle: 'Éthique et déontologie médicale',
    icon: Shield,
    color: 'bg-green-500',
    description: 'Principes éthiques, déontologie et responsabilités professionnelles.'
  },
  {
    code: 'IC-3',
    title: 'Le raisonnement et la décision en médecine',
    subtitle: 'Démarche diagnostique et thérapeutique',
    icon: Brain,
    color: 'bg-purple-500',
    description: 'Processus de raisonnement clinique, prise de décision et gestion de l\'incertitude.'
  },
  {
    code: 'IC-4',
    title: 'La sécurité du patient. La gestion des risques',
    subtitle: 'Qualité et sécurité des soins',
    icon: Shield,
    color: 'bg-red-500',
    description: 'Prévention des erreurs, gestion des risques et amélioration continue de la qualité.'
  },
  {
    code: 'IC-5',
    title: 'L\'annonce d\'une maladie grave ou létale ou d\'un dommage associé aux soins',
    subtitle: 'Communication difficile et accompagnement',
    icon: BookOpen,
    color: 'bg-orange-500',
    description: 'Techniques d\'annonce, accompagnement psychologique et gestion des émotions.'
  },
  {
    code: 'IC-6',
    title: 'Organisation de l\'exercice clinique et sécurisation du parcours patient',
    subtitle: 'Coordination des soins et continuité',
    icon: Settings,
    color: 'bg-blue-600',
    description: 'Organisation des soins, coordination interprofessionnelle et sécurisation du parcours.'
  },
  {
    code: 'IC-7',
    title: 'Les droits individuels et collectifs du patient',
    subtitle: 'Respect et protection des droits',
    icon: Scale,
    color: 'bg-green-600',
    description: 'Droits des patients, consentement éclairé et médiation en santé.'
  },
  {
    code: 'IC-8',
    title: 'Les discriminations',
    subtitle: 'Identification et lutte anti-discrimination',
    icon: AlertTriangle,
    color: 'bg-orange-600',
    description: 'Reconnaissance des discriminations, prévention et intervention active.'
  },
  {
    code: 'IC-9',
    title: 'Certificats médicaux dans le cadre des violences',
    subtitle: 'Expertise médico-légale et protection',
    icon: FileText,
    color: 'bg-purple-600',
    description: 'Rédaction de certificats, accompagnement des victimes et expertise légale.'
  },
  {
    code: 'IC-10',
    title: 'Approches transversales du corps',
    subtitle: 'Vision holistique et multidimensionnelle',
    icon: Microscope,
    color: 'bg-teal-500',
    description: 'Approches intégratives du corps, dimensions psychosomatiques et transversalité.'
  },
  {
    code: 'OIC-010-03-B',
    title: 'Impact des différentes maladies sur l\'expérience du corps',
    subtitle: 'Expérience corporelle et maladie',
    icon: Brain,
    color: 'bg-cyan-500',
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
              <item.icon className="h-5 w-5 text-gray-500" />
              {item.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">{item.description}</p>
            <Badge className="mt-2" variant="secondary">{item.subtitle}</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

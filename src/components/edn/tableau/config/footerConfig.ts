// Configuration centralisée pour tous les FooterIC (IC1-IC10 + OIC010)
// Élimine la duplication de 11 fichiers identiques

import { 
  Heart, Users, MessageCircle, Shield, Brain, Target, AlertTriangle,
  BookOpen, Scale, Award, CheckCircle, Lightbulb, Building2, TrendingUp,
  Stethoscope, Pill, Activity, ClipboardList, FileText, Glasses,
  Globe, Briefcase, GraduationCap, LucideIcon
} from 'lucide-react';

export interface ICKnowledge {
  label: string;
  icon: LucideIcon;
  colorClass: string;
}

export interface ICFooterConfig {
  icCode: string;
  title: string;
  titleIcon: LucideIcon;
  expectedCountRangA: number;
  expectedCountRangB: number;
  themeColorClass: string; // e.g., 'primary', 'success', 'warning', 'accent'
  knowledgeListRangA: ICKnowledge[];
  knowledgeListRangB?: ICKnowledge[];
  keyPointsRangA: string[];
  keyPointsRangB?: string[];
  pitfallsRangA: string[];
  pitfallsRangB?: string[];
  badges: { label: string; colorClass: string }[];
  objectivesRangA: string[];
  objectivesRangB?: string[];
}

// IC-1: Relation médecin-malade
export const IC1_CONFIG: ICFooterConfig = {
  icCode: 'IC-1',
  title: 'Relation médecin-malade',
  titleIcon: Heart,
  expectedCountRangA: 15,
  expectedCountRangB: 0,
  themeColorClass: 'primary',
  knowledgeListRangA: [
    { label: 'Définition relation médecin-malade', icon: Target, colorClass: 'text-primary' },
    { label: 'Déterminants de la relation', icon: Users, colorClass: 'text-success' },
    { label: 'Corrélats cliniques', icon: Brain, colorClass: 'text-accent' },
    { label: 'Approche centrée patient', icon: Heart, colorClass: 'text-warning' },
    { label: 'Représentations maladie', icon: MessageCircle, colorClass: 'text-accent' },
    { label: 'Facteurs information patient', icon: Shield, colorClass: 'text-accent' },
    { label: 'Ajustement au stress', icon: Target, colorClass: 'text-destructive' },
    { label: 'Mécanismes de défense', icon: Brain, colorClass: 'text-accent' },
    { label: 'Empathie clinique', icon: Heart, colorClass: 'text-accent' },
    { label: 'Alliance thérapeutique', icon: Users, colorClass: 'text-success' },
    { label: 'Processus changement', icon: MessageCircle, colorClass: 'text-warning' },
    { label: 'Entretien motivationnel', icon: Shield, colorClass: 'text-accent' },
    { label: 'Se montrer empathique', icon: Heart, colorClass: 'text-accent' },
    { label: 'Communication adaptée', icon: MessageCircle, colorClass: 'text-primary' },
    { label: 'Annonce mauvaise nouvelle', icon: AlertTriangle, colorClass: 'text-success' },
  ],
  keyPointsRangA: [
    'Approche centrée patient',
    'Alliance thérapeutique',
    'Communication empathique',
    'Annonce progressive',
  ],
  pitfallsRangA: [
    'Paternalisme médical',
    'Manque d\'écoute active',
    'Information inadaptée',
  ],
  badges: [
    { label: 'Relation thérapeutique', colorClass: 'primary' },
    { label: 'Communication', colorClass: 'success' },
    { label: 'Empathie', colorClass: 'accent' },
  ],
  objectivesRangA: [
    'Établir une relation de confiance',
    'Pratiquer l\'écoute active',
    'Adapter la communication au patient',
    'Annoncer une mauvaise nouvelle avec empathie',
  ],
};

// IC-2: Exercice médical
export const IC2_CONFIG: ICFooterConfig = {
  icCode: 'IC-2',
  title: 'Valeurs professionnelles',
  titleIcon: BookOpen,
  expectedCountRangA: 7,
  expectedCountRangB: 2,
  themeColorClass: 'accent',
  knowledgeListRangA: [
    { label: 'Identifier professionnels et compétences', icon: Users, colorClass: 'text-primary' },
    { label: 'Définition pratique médicale et éthique', icon: Target, colorClass: 'text-success' },
    { label: 'Normes et valeurs professionnelles', icon: Scale, colorClass: 'text-warning' },
    { label: 'Organisation et régulation', icon: Shield, colorClass: 'text-accent' },
    { label: 'EBM et responsabilité patient', icon: Award, colorClass: 'text-accent' },
    { label: 'Déontologie et conflits', icon: CheckCircle, colorClass: 'text-destructive' },
    { label: 'Interactions interprofessionnelles', icon: Brain, colorClass: 'text-accent' },
  ],
  knowledgeListRangB: [
    { label: 'Organisation exercice et statuts professionnels', icon: Award, colorClass: 'text-success' },
    { label: 'Rôle des ordres professionnels', icon: Shield, colorClass: 'text-primary' },
  ],
  keyPointsRangA: [
    'Éthique médicale',
    'Déontologie',
    'Evidence-Based Medicine',
  ],
  keyPointsRangB: [
    'Statuts professionnels',
    'Ordres professionnels',
  ],
  pitfallsRangA: [
    'Conflits d\'intérêts non déclarés',
    'Confusion EBM et pratique traditionnelle',
  ],
  badges: [
    { label: 'Éthique', colorClass: 'primary' },
    { label: 'Déontologie', colorClass: 'warning' },
    { label: 'EBM', colorClass: 'success' },
  ],
  objectivesRangA: [
    'Comprendre les principes éthiques',
    'Appliquer les règles déontologiques',
    'Intégrer l\'EBM dans la pratique',
  ],
};

// IC-3: Raisonnement clinique
export const IC3_CONFIG: ICFooterConfig = {
  icCode: 'IC-3',
  title: 'Raisonnement clinique',
  titleIcon: Brain,
  expectedCountRangA: 15,
  expectedCountRangB: 8,
  themeColorClass: 'primary',
  knowledgeListRangA: [],
  keyPointsRangA: [
    'Médecine basée sur les preuves',
    'Styles de raisonnement',
    'Décision médicale et partagée',
    'TICE et aide à la décision',
  ],
  keyPointsRangB: [
    'Supports au raisonnement clinique',
    'Bases d\'information médicale',
    'Logique thérapeutique',
    'Analyse décisionnelle avancée',
  ],
  pitfallsRangA: [
    'Biais cognitifs',
    'Ancrage diagnostique',
  ],
  badges: [
    { label: 'EBM', colorClass: 'primary' },
    { label: 'Décision partagée', colorClass: 'success' },
    { label: 'Raisonnement', colorClass: 'accent' },
  ],
  objectivesRangA: [
    'Comprendre les principes de l\'EBM',
    'Maîtriser la démarche clinique',
    'Utiliser les outils d\'aide à la décision',
    'Intégrer préférences patients',
  ],
  objectivesRangB: [
    'Maîtriser les outils de raisonnement',
    'Analyser les dynamiques décisionnelles',
    'Comprendre les architectures SI',
    'Gérer les controverses médicales',
  ],
};

// IC-4: Qualité et sécurité
export const IC4_CONFIG: ICFooterConfig = {
  icCode: 'IC-4',
  title: 'Qualité et sécurité des soins',
  titleIcon: Target,
  expectedCountRangA: 13,
  expectedCountRangB: 22,
  themeColorClass: 'warning',
  knowledgeListRangA: [],
  keyPointsRangA: [
    'Qualité : 7 dimensions (SPEC-AEC)',
    'EIAS : 40-50% évitables',
    'SHA : 7 temps, 20-30 secondes',
    'Antisepsie : tissus vivants',
    'Asepsie : prévention contamination',
  ],
  keyPointsRangB: [
    'Économique : 760M€/an IAS Europe',
    'Transmission : Plasmides résistants',
    'Structures : 3 niveaux coordination',
    'Causes : Modèle systémique Reason',
    'Leadership : Culture transformation',
  ],
  pitfallsRangA: [
    'Confondre qualité et sécurité',
    'EIAS ≠ complication attendue',
    'Antisepsie ≠ désinfection',
    'Gants ne dispensent pas SHA',
    'Approche punitive vs culture juste',
  ],
  pitfallsRangB: [
    'Analyse superficielle vs systémique',
    'Bouc émissaire vs causes multiples',
    'Résistance stable vs transférable',
    'Coût partiel vs coût global',
    'Vision locale vs approche système',
  ],
  badges: [
    { label: 'Démarche qualité', colorClass: 'primary' },
    { label: 'Sécurité des soins', colorClass: 'destructive' },
    { label: 'Prévention EIAS', colorClass: 'success' },
    { label: 'Hygiène des mains', colorClass: 'accent' },
    { label: 'Antisepsie-Asepsie', colorClass: 'warning' },
  ],
  objectivesRangA: [
    'Comprendre la démarche qualité',
    'Identifier les EIAS',
    'Maîtriser l\'hygiène des mains',
  ],
};

// IC-5: Système de santé
export const IC5_CONFIG: ICFooterConfig = {
  icCode: 'IC-5',
  title: 'Organisation du système de santé',
  titleIcon: Building2,
  expectedCountRangA: 20,
  expectedCountRangB: 10,
  themeColorClass: 'success',
  knowledgeListRangA: [],
  keyPointsRangA: [
    'Organisation générale du système',
    'Structures hospitalières',
    'Soins primaires et réseaux',
    'Financement et tarification',
  ],
  keyPointsRangB: [
    'Démographie médicale',
    'Innovation en santé',
    'Coordination des soins',
    'Gouvernance du système',
  ],
  pitfallsRangA: [
    'Confusion entre niveaux de soins',
    'Méconnaissance du financement',
  ],
  badges: [
    { label: 'Organisation', colorClass: 'success' },
    { label: 'Financement', colorClass: 'primary' },
    { label: 'Coordination', colorClass: 'accent' },
  ],
  objectivesRangA: [
    'Comprendre l\'organisation du système',
    'Maîtriser les circuits de soins',
    'Connaître les modes de financement',
    'S\'orienter dans le système',
  ],
  objectivesRangB: [
    'Analyser les enjeux stratégiques',
    'Anticiper les évolutions',
    'Développer une vision systémique',
    'Participer à la gouvernance',
  ],
};

// Configurations pour IC6-IC10 et OIC010 (structure similaire)
export const IC6_CONFIG: ICFooterConfig = {
  icCode: 'IC-6',
  title: 'Santé publique',
  titleIcon: Globe,
  expectedCountRangA: 12,
  expectedCountRangB: 6,
  themeColorClass: 'accent',
  knowledgeListRangA: [],
  keyPointsRangA: ['Épidémiologie', 'Prévention', 'Promotion de la santé'],
  pitfallsRangA: ['Confusion prévention primaire/secondaire'],
  badges: [{ label: 'Santé publique', colorClass: 'accent' }],
  objectivesRangA: ['Comprendre les enjeux de santé publique'],
};

export const IC7_CONFIG: ICFooterConfig = {
  icCode: 'IC-7',
  title: 'Éthique et déontologie',
  titleIcon: Scale,
  expectedCountRangA: 10,
  expectedCountRangB: 5,
  themeColorClass: 'primary',
  knowledgeListRangA: [],
  keyPointsRangA: ['Principes éthiques', 'Secret médical', 'Consentement'],
  pitfallsRangA: ['Confusion consentement/information'],
  badges: [{ label: 'Éthique', colorClass: 'primary' }],
  objectivesRangA: ['Appliquer les principes éthiques'],
};

export const IC8_CONFIG: ICFooterConfig = {
  icCode: 'IC-8',
  title: 'Droit et responsabilité',
  titleIcon: Briefcase,
  expectedCountRangA: 8,
  expectedCountRangB: 4,
  themeColorClass: 'warning',
  knowledgeListRangA: [],
  keyPointsRangA: ['Responsabilité civile', 'Responsabilité pénale', 'Responsabilité ordinale'],
  pitfallsRangA: ['Confusion types de responsabilité'],
  badges: [{ label: 'Droit médical', colorClass: 'warning' }],
  objectivesRangA: ['Comprendre les responsabilités du médecin'],
};

export const IC9_CONFIG: ICFooterConfig = {
  icCode: 'IC-9',
  title: 'Certification et accréditation',
  titleIcon: Award,
  expectedCountRangA: 6,
  expectedCountRangB: 3,
  themeColorClass: 'success',
  knowledgeListRangA: [],
  keyPointsRangA: ['Certification HAS', 'Accréditation', 'Indicateurs qualité'],
  pitfallsRangA: ['Confusion certification/accréditation'],
  badges: [{ label: 'Certification', colorClass: 'success' }],
  objectivesRangA: ['Comprendre la démarche de certification'],
};

export const IC10_CONFIG: ICFooterConfig = {
  icCode: 'IC-10',
  title: 'Formation et DPC',
  titleIcon: GraduationCap,
  expectedCountRangA: 5,
  expectedCountRangB: 3,
  themeColorClass: 'accent',
  knowledgeListRangA: [],
  keyPointsRangA: ['DPC', 'Formation continue', 'Évaluation des pratiques'],
  pitfallsRangA: ['Confusion DPC/formation continue'],
  badges: [{ label: 'Formation', colorClass: 'accent' }],
  objectivesRangA: ['Comprendre le DPC'],
};

export const OIC010_CONFIG: ICFooterConfig = {
  icCode: 'OIC-010',
  title: 'Objectifs intégratifs',
  titleIcon: Target,
  expectedCountRangA: 10,
  expectedCountRangB: 5,
  themeColorClass: 'primary',
  knowledgeListRangA: [],
  keyPointsRangA: ['Intégration des compétences', 'Approche globale', 'Transversalité'],
  pitfallsRangA: ['Vision compartimentée'],
  badges: [{ label: 'Intégration', colorClass: 'primary' }],
  objectivesRangA: ['Développer une vision intégrée'],
};

// Map pour accès dynamique
export const FOOTER_CONFIGS: Record<string, ICFooterConfig> = {
  'IC-1': IC1_CONFIG,
  'IC-2': IC2_CONFIG,
  'IC-3': IC3_CONFIG,
  'IC-4': IC4_CONFIG,
  'IC-5': IC5_CONFIG,
  'IC-6': IC6_CONFIG,
  'IC-7': IC7_CONFIG,
  'IC-8': IC8_CONFIG,
  'IC-9': IC9_CONFIG,
  'IC-10': IC10_CONFIG,
  'OIC-010': OIC010_CONFIG,
};

export const getFooterConfig = (icCode: string): ICFooterConfig | undefined => {
  return FOOTER_CONFIGS[icCode];
};

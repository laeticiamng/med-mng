// ==========================================
// MED-MNG MEDICAL DATA CONSTANTS
// ==========================================

import { MedicalCategory, MedicalSpecialty, MedicalItem } from '@/types';

export const MEDICAL_CATEGORIES: Record<MedicalCategory, string> = {
  IC1: 'Colloque Singulier',
  IC2: 'Situations Cliniques Courantes',
  IC3: 'Diagnostic et Investigations',
  IC4: 'Thérapeutiques et Interventions',
  IC5: 'Éthique et Déontologie Médicale',
  ECOS: 'Examens Cliniques Objectifs Structurés',
  Clinical_Cases: 'Cas Cliniques Complexes',
  Pathophysiology: 'Physiopathologie',
  Therapeutics: 'Thérapeutiques Avancées',
  Diagnosis: 'Diagnostic Différentiel',
  Prevention: 'Médecine Préventive'
};

export const MEDICAL_SPECIALTIES: Record<MedicalSpecialty, string> = {
  Cardiology: 'Cardiologie',
  Pulmonology: 'Pneumologie',
  Neurology: 'Neurologie',
  Gastroenterology: 'Gastro-entérologie',
  Endocrinology: 'Endocrinologie',
  Nephrology: 'Néphrologie',
  Hematology: 'Hématologie',
  Oncology: 'Oncologie',
  Infectious_Diseases: 'Maladies Infectieuses',
  Emergency_Medicine: 'Médecine d\'Urgence',
  Internal_Medicine: 'Médecine Interne',
  Pediatrics: 'Pédiatrie',
  Geriatrics: 'Gériatrie',
  Psychiatry: 'Psychiatrie',
  Surgery: 'Chirurgie',
  Radiology: 'Radiologie',
  Anesthesiology: 'Anesthésie-Réanimation',
  Pathology: 'Anatomopathologie',
  Public_Health: 'Santé Publique'
};

export const MUSIC_STYLES = [
  {
    id: 'medical-lofi',
    name: 'Medical LoFi',
    description: 'Rythmes apaisants pour l\'étude médicale',
    bpm: '70-90',
    mood: 'calm',
    bestFor: ['study', 'concentration', 'memorization']
  },
  {
    id: 'clinical-hip-hop',
    name: 'Clinical Hip-Hop',
    description: 'Hip-hop médical style Nekfeu pour mémorisation',
    bpm: '90-110',
    mood: 'energetic',
    bestFor: ['memorization', 'rhythm-based learning', 'complex concepts']
  },
  {
    id: 'therapeutic-jazz',
    name: 'Therapeutic Jazz',
    description: 'Jazz moderne pour cas cliniques complexes',
    bpm: '100-130',
    mood: 'sophisticated',
    bestFor: ['complex reasoning', 'differential diagnosis']
  },
  {
    id: 'emergency-electronic',
    name: 'Emergency Electronic',
    description: 'Électronique rythmée pour procédures d\'urgence',
    bpm: '120-140',
    mood: 'urgent',
    bestFor: ['procedures', 'emergency protocols', 'quick decisions']
  },
  {
    id: 'ambient-healing',
    name: 'Ambient Healing',
    description: 'Ambiance thérapeutique pour éthique médicale',
    bpm: '60-80',
    mood: 'meditative',
    bestFor: ['ethics', 'reflection', 'communication skills']
  },
  {
    id: 'surgical-precision',
    name: 'Surgical Precision',
    description: 'Rythmes précis pour apprentissage chirurgical',
    bpm: '100-120',
    mood: 'focused',
    bestFor: ['procedures', 'anatomy', 'technical skills']
  }
];

export const SAMPLE_MEDICAL_ITEMS: MedicalItem[] = [
  {
    id: 'ic1-001',
    item_code: 'IC1-001',
    title: 'Insuffisance Cardiaque - Approche Diagnostique',
    description: 'Démarche diagnostique face à une insuffisance cardiaque',
    category: 'IC1',
    competencies: [
      {
        id: 'comp-001',
        code: 'DG-CARD-001',
        title: 'Diagnostic d\'insuffisance cardiaque',
        description: 'Capacité à diagnostiquer une insuffisance cardiaque',
        level: 'Intermediate',
        domain: 'Clinical_Skills',
        assessment_criteria: [
          'Anamnèse complète',
          'Examen physique ciblé',
          'Interprétation des examens complémentaires'
        ]
      }
    ],
    difficulty_level: 'R2',
    estimated_study_time: 45,
    learning_objectives: [
      'Identifier les signes cliniques d\'insuffisance cardiaque',
      'Prescrire les examens complémentaires appropriés',
      'Établir un plan thérapeutique adapté'
    ],
    tags: ['cardiologie', 'insuffisance cardiaque', 'diagnostic'],
    metadata: {
      speciality: 'Cardiology',
      last_updated: new Date().toISOString(),
      version: '1.0',
      author: 'Dr. MED-MNG',
      validation_status: 'validated',
      usage_stats: {
        total_generations: 0,
        avg_completion_rate: 0,
        user_feedback_score: 0,
        last_accessed: new Date().toISOString()
      }
    }
  }
];

export const GENERATION_PROMPTS = {
  RANG_A: {
    prefix: "Style Nekfeu médical - Rang A (Colloque Singulier)",
    structure: "Couplet-Refrain-Couplet-Pont-Refrain final",
    tone: "Professionnel, didactique, mémorisation optimisée",
    techniques: ["Rimes riches", "Allitérations médicales", "Répétitions pédagogiques"]
  },
  RANG_B: {
    prefix: "Style Nekfeu médical - Rang B (Application Pratique)",
    structure: "Verses pratiques avec exemples cliniques concrets",
    tone: "Pragmatique, cas réels, application directe",
    techniques: ["Storytelling clinique", "Mnémotechniques", "Situations vécues"]
  },
  RANG_AB: {
    prefix: "Style Nekfeu médical - Mix A+B (Synthèse Complète)",
    structure: "Fusion théorie-pratique, apprentissage holistique",
    tone: "Complet, intégratif, excellence médicale",
    techniques: ["Synthèse théorico-pratique", "Connexions interdisciplinaires", "Vision globale"]
  }
};

export const COMPETENCY_FRAMEWORKS = {
  CanMEDS: [
    'Medical Expert',
    'Communicator', 
    'Collaborator',
    'Leader',
    'Health Advocate',
    'Scholar',
    'Professional'
  ],
  ACGME: [
    'Patient Care',
    'Medical Knowledge',
    'Practice-based Learning',
    'Interpersonal Communication',
    'Professionalism',
    'Systems-based Practice'
  ],
  French_ECN: [
    'Connaissances',
    'Compétences cliniques',
    'Communication',
    'Professionnalisme',
    'Raisonnement clinique',
    'Gestion des risques'
  ]
};

export const ASSESSMENT_RUBRICS = {
  knowledge: {
    novice: "Connaissances de base limitées",
    advanced_beginner: "Connaissances théoriques solides",
    competent: "Application correcte en situation standard",
    proficient: "Adaptation aux situations variées",
    expert: "Maîtrise complète et innovation"
  },
  clinical_skills: {
    novice: "Compétences techniques limitées",
    advanced_beginner: "Exécution avec supervision",
    competent: "Autonomie en situation standard", 
    proficient: "Efficacité en situation complexe",
    expert: "Excellence technique et pédagogique"
  }
};

import { MessageCircle, HandIcon, FileText } from 'lucide-react';

export const scenarioData = {
  id: 'SD003',
  title: 'Douleur thoracique',
  specialty: 'Cardiologie',
  duration: 15,
  pitch: "Vous êtes interne aux urgences. M. Dupont, 52 ans, consulte pour une douleur thoracique apparue il y 2 heures.",
  patient: {
    name: 'M. Dupont',
    age: 52,
    sex: 'Masculin',
    avatar: '👨‍💼',
    background: 'Cadre supérieur, fumeur 1 paquet/jour depuis 20 ans, père décédé d\'infarctus à 58 ans'
  },
  steps: [
    {
      title: 'Je dis',
      subtitle: 'Interrogatoire dirigé',
      icon: MessageCircle,
      questions: [
        'Depuis quand avez-vous mal ?',
        'Pouvez-vous décrire cette douleur ?',
        'Qu\'est-ce qui déclenche ou soulage la douleur ?',
        'Avez-vous d\'autres symptômes associés ?',
        'Avez-vous des antécédents médicaux ?'
      ]
    },
    {
      title: 'Je fais',
      subtitle: 'Examen clinique',
      icon: HandIcon,
      actions: [
        'Prise des constantes vitales',
        'Inspection générale',
        'Auscultation cardiaque',
        'Auscultation pulmonaire',
        'Palpation abdominale'
      ]
    },
    {
      title: 'Je conclus',
      subtitle: 'Synthèse et prise en charge',
      icon: FileText,
      elements: [
        'Résumé de la situation',
        'Hypothèses diagnostiques',
        'Examens complémentaires',
        'Prise en charge immédiate'
      ]
    }
  ]
};

export const quizQuestions = [
  {
    question: 'Quel est le premier examen à réaliser devant une douleur thoracique ?',
    options: ['ECG', 'Radio thorax', 'Échographie cardiaque', 'Biologie'],
    correct: 0
  },
  {
    question: 'Quelle est la durée typique d\'une douleur d\'angor instable ?',
    options: ['< 2 minutes', '2-10 minutes', '> 20 minutes', 'Variable'],
    correct: 2
  },
  {
    question: 'Devant une suspicion de SCA, quelle attitude adopter ?',
    options: ['Attendre les résultats', 'Hospitalisation immédiate', 'Traitement ambulatoire', 'Avis spécialisé différé'],
    correct: 1
  },
  {
    question: 'Quel marqueur biologique est le plus spécifique de l\'infarctus ?',
    options: ['CK', 'CK-MB', 'Troponine', 'LDH'],
    correct: 2
  }
];

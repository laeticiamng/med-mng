
import { supabase } from '@/integrations/supabase/client';
import { runAndDisplayIC2Audit } from './runIC2Audit';

// Contenu complet IC-2 selon E-LiSA officiel - 7 Rang A + 2 Rang B
const COMPLETE_IC2_CONTENT = {
  tableau_rang_a: {
    title: "Rang A - Connaissances fondamentales (7 concepts E-LiSA)",
    sections: [
      {
        title: "Identifier les professionnels, compétences et ressources liés à un rôle particulier dans une organisation de santé",
        content: "Cartographie complète des acteurs de santé : médecins spécialistes, généralistes, chirurgiens-dentistes, sages-femmes, pharmaciens, infirmiers, masseurs-kinésithérapeutes, pédicures-podologues selon leurs rôles organisationnels et compétences spécifiques.",
        keywords: ["professionnels", "compétences", "ressources", "organisation", "santé", "acteurs", "spécialistes", "généralistes"]
      },
      {
        title: "Connaître la définition de la pratique médicale et connaître la signification de l'éthique",
        content: "La pratique médicale est une activité professionnelle du médecin intégrant diagnostic, traitement, prévention dans un cadre scientifique et relationnel structuré. L'éthique désigne la réflexion philosophique sur l'action juste et appropriée, questionnement moral face aux dilemmes de la pratique médicale.",
        keywords: ["pratique médicale", "définition", "éthique", "diagnostic", "traitement", "prévention", "scientifique", "relationnel", "réflexion", "philosophique"]
      },
      {
        title: "Connaître les définitions de normes et de valeurs professionnelles",
        content: "Valeurs = principes fondamentaux guidant l'action (dignité, respect, bienfaisance). Normes = règles concrètes traduisant ces valeurs en obligations. Les normes découlent des valeurs mais s'imposent différemment selon les contextes.",
        keywords: ["normes", "valeurs", "professionnelles", "principes", "dignité", "respect", "bienfaisance", "règles", "obligations"]
      },
      {
        title: "Connaître l'organisation sociale et politique de la profession médicale et sa régulation étatique",
        content: "Organisation professionnelle sous contrôle étatique croissant : ordres professionnels, régulation des dépenses, évaluation qualité, encadrement juridique. Équilibre complexe entre autonomie professionnelle et contrôle sociétal.",
        keywords: ["organisation", "sociale", "politique", "profession", "régulation", "étatique", "ordres", "contrôle"]
      },
      {
        title: "Connaître les principes de la médecine fondée sur les preuves et de la médecine basée sur la responsabilité et l'expérience du malade",
        content: "Evidence-Based Medicine combinée à l'approche intégrant l'expérience vécue du patient, ses préférences et sa responsabilité dans les décisions de santé. Équilibre entre rigueur scientifique, expertise médicale et autonomie du patient.",
        keywords: ["médecine fondée", "preuves", "evidence", "EBM", "responsabilité", "expérience", "patient", "préférences", "autonomie"]
      },
      {
        title: "Connaître les principes de déontologie médicale, connaître la notion de conflit de valeurs et de conflit d'intérêts",
        content: "Ensemble des devoirs professionnels codifiés régissant l'exercice médical + gestion des tensions entre valeurs contradictoires et des situations où intérêts personnels interfèrent avec intérêt du patient.",
        keywords: ["déontologie", "devoirs", "professionnels", "code", "conflit", "valeurs", "intérêts", "tensions"]
      },
      {
        title: "Connaître les interactions professionnelles et la collaboration interprofessionnelle",
        content: "Modes de coopération entre professionnels de santé : coordination, délégation, référence, travail en équipe pluridisciplinaire pour optimiser la prise en charge. Réunions de concertation pluridisciplinaire, consultations partagées, protocoles de coopération.",
        keywords: ["interactions", "collaboration", "interprofessionnelle", "coordination", "équipe", "pluridisciplinaire", "coopération"]
      }
    ]
  },
  tableau_rang_b: {
    title: "Rang B - Connaissances approfondies (2 concepts E-LiSA)",
    sections: [
      {
        title: "Connaître l'organisation de l'exercice des professionnels de santé en France et leurs statuts",
        content: "Organisation statutaire complexe : fonctionnaires (hospitaliers publics), salariés (privé), libéraux, mixtes, avec réglementations spécifiques par statut. Médecins hospitaliers (PH, MCU-PH, CCA), médecins libéraux (secteur 1/2), salariés cliniques privées.",
        keywords: ["organisation", "exercice", "professionnels", "France", "statuts", "fonctionnaires", "salariés", "libéraux"]
      },
      {
        title: "Connaître le rôle des ordres professionnels et leur fonctionnement",
        content: "Instances de régulation professionnelle : inscription, discipline, surveillance déontologique, organisation territoriale (départemental, régional, national). CNOM, conseils départementaux et régionaux, procédures disciplinaires.",
        keywords: ["ordres", "professionnels", "régulation", "discipline", "surveillance", "déontologique", "CNOM", "disciplinaires"]
      }
    ]
  }
};

// Paroles musicales complètes pour IC-2 (7 Rang A + 2 Rang B)
const COMPLETE_IC2_PAROLES = [
  "Dans les couloirs blancs de l'hôpital moderne",
  "Résonnent les pas de ceux qui soignent et espèrent", 
  "Sept connaissances guident leur noble mission",
  "Valeurs, déontologie, organisation en fusion",
  "",
  "Refrain :",
  "IC-2, les valeurs du médecin",
  "Responsabilité, compassion, chemin", 
  "Du rang A fondamental au rang B approfondi",
  "Chaque professionnel porte en lui l'éthique et la vie",
  "",
  "Identifier d'abord tous les professionnels",
  "Leurs compétences, leurs rôles essentiels",
  "Définir la pratique, comprendre l'éthique", 
  "Normes et valeurs, base authentique",
  "",
  "Organisation sociale, régulation d'État",
  "Médecine fondée sur preuves qui ne se tait",
  "Déontologie stricte, conflits à gérer",
  "Interactions d'équipe, savoir collaborer",
  "",
  "Refrain :",
  "IC-2, les valeurs du médecin", 
  "Responsabilité, compassion, chemin",
  "Du rang A fondamental au rang B approfondi",
  "Chaque professionnel porte en lui l'éthique et la vie",
  "",
  "Rang B maintenant, approfondissement",
  "Statuts d'exercice, organisation vraiment",
  "Ordres professionnels, leur rôle précis",
  "Régulation, discipline, cadre établi",
  "",
  "Final :",
  "Neuf connaissances, E-LiSA officiel", 
  "Sept en A, deux en B, c'est essentiel",
  "Valeurs professionnelles, éternelles et sûres",
  "Guident nos pas vers la médecine pure"
];

// Quiz questions complètes
const COMPLETE_IC2_QUIZ = {
  questions: [
    {
      question: "Combien de connaissances Rang A sont attendues pour IC-2 selon E-LiSA ?",
      options: ["6", "7", "8", "9"],
      correct: 1,
      explanation: "Selon le référentiel E-LiSA officiel, IC-2 comprend exactement 7 connaissances de Rang A."
    },
    {
      question: "Quelle est la différence entre valeurs et normes professionnelles ?",
      options: [
        "Il n'y en a pas",
        "Les valeurs sont des principes, les normes sont des règles concrètes", 
        "Les normes sont plus importantes",
        "Les valeurs changent, pas les normes"
      ],
      correct: 1,
      explanation: "Les valeurs sont des principes fondamentaux (dignité, respect), les normes sont des règles concrètes qui traduisent ces valeurs."
    },
    {
      question: "Que signifie EBM en médecine ?",
      options: [
        "European Board of Medicine",
        "Evidence-Based Medicine", 
        "Emergency Basic Medicine",
        "Ethical Biomedical Medicine"
      ],
      correct: 1,
      explanation: "EBM signifie Evidence-Based Medicine : médecine fondée sur les preuves scientifiques."
    },
    {
      question: "Combien de connaissances Rang B contient IC-2 selon E-LiSA ?",
      options: ["1", "2", "3", "4"],
      correct: 1,
      explanation: "IC-2 contient exactement 2 connaissances de Rang B selon le référentiel E-LiSA."
    },
    {
      question: "Quel est le rôle principal des ordres professionnels ?",
      options: [
        "Former les médecins",
        "Régulation, discipline et surveillance déontologique",
        "Fixer les tarifs médicaux", 
        "Organiser les concours"
      ],
      correct: 1,
      explanation: "Les ordres professionnels assurent la régulation, la discipline et la surveillance déontologique des professions de santé."
    }
  ]
};

// Structure bande dessinée IC-2
const COMPLETE_IC2_COMIC = {
  title: "Les Valeurs Professionnelles - Une Journée à l'Hôpital",
  panels: [
    {
      title: "Planche 1 - L'Équipe Soignante",
      description: "Présentation des différents professionnels de santé et leurs rôles",
      dialogue: "Dr Martin : 'Chaque professionnel a ses compétences spécifiques dans notre organisation.'"
    },
    {
      title: "Planche 2 - Consultation Éthique", 
      description: "Un médecin face à un dilemme éthique avec un patient",
      dialogue: "Dr Leroy : 'La pratique médicale ne peut se séparer de la réflexion éthique.'"
    },
    {
      title: "Planche 3 - Déontologie en Action",
      description: "Application concrète du code de déontologie et gestion d'un conflit d'intérêts",
      dialogue: "Dr Dubois : 'Le code de déontologie guide nos décisions, même dans les situations complexes.'"
    },
    {
      title: "Planche 4 - Collaboration Interprofessionnelle",
      description: "Réunion pluridisciplinaire montrant les interactions entre professionnels",
      dialogue: "Équipe : 'Ensemble, nous optimisons la prise en charge de nos patients.'"
    }
  ]
};

export async function completeIC2Item() {
  console.log('🔧 Vérification et complétion complète de l\'item IC-2 (7 Rang A + 2 Rang B)...');
  
  try {
    // D'abord, vérifier l'état actuel
    const auditReport = await runAndDisplayIC2Audit();
    
    if (auditReport.completeness === 100) {
      console.log('✅ Item IC-2 déjà complet à 100%');
      return auditReport;
    }
    
    console.log('🔧 Mise à jour COMPLÈTE du contenu IC-2 selon E-LiSA (7 Rang A + 2 Rang B)...');
    
    // Mise à jour complète de l'item IC-2 avec TOUS les éléments
    const { data, error } = await supabase
      .from('edn_items_immersive')
      .upsert({
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', // ID fixe pour IC-2
        slug: 'valeurs-professionnelles-medecin',
        item_code: 'IC-2',
        title: 'Les valeurs professionnelles du médecin et des autres professions de santé',
        subtitle: 'Fiche E-LiSA officielle - 9 connaissances (7 Rang A + 2 Rang B)',
        pitch_intro: 'Découvrez les 9 connaissances essentielles selon le référentiel E-LiSA officiel : valeurs cardinales, déontologie, organisation professionnelle et régulation étatique. Une exploration complète des principes éthiques et organisationnels qui fondent l\'exercice médical moderne.',
        visual_ambiance: {
          theme: "medical_ethics",
          colors: ["blue", "green", "amber"],
          mood: "professional",
          style: "modern_medical"
        },
        audio_ambiance: {
          style: "classical",
          tempo: "moderate", 
          instruments: ["piano", "strings"],
          mood: "reflective"
        },
        tableau_rang_a: COMPLETE_IC2_CONTENT.tableau_rang_a,
        tableau_rang_b: COMPLETE_IC2_CONTENT.tableau_rang_b,
        scene_immersive: {
          setting: "Hôpital universitaire moderne - Service de médecine interne",
          characters: [
            {
              name: "Dr. Marie Leroy",
              role: "Médecin senior - Chef de service",
              description: "Incarnation des valeurs professionnelles, mentore expérimentée"
            },
            {
              name: "Dr. Thomas Dubois", 
              role: "Interne en médecine",
              description: "Jeune médecin en formation, questionne les valeurs"
            },
            {
              name: "Équipe pluridisciplinaire",
              role: "Professionnels de santé",
              description: "Infirmiers, pharmaciens, kinés illustrant la collaboration"
            }
          ],
          scenario: "Une journée type dans le service illustrant concrètement chacune des 9 connaissances E-LiSA en action : consultation éthique, réunion interprofessionnelle, cas de déontologie, etc."
        },
        paroles_musicales: COMPLETE_IC2_PAROLES,
        bande_dessinee: COMPLETE_IC2_COMIC,
        interaction_config: {
          type: "comprehensive_learning",
          title: "Maîtrisez les 9 connaissances IC-2 selon E-LiSA",
          exercises: [
            {
              type: "concept_matching",
              title: "Associez chaque concept à son rang",
              items: [
                { concept: "Définition pratique médicale", rang: "A" },
                { concept: "Organisation des statuts", rang: "B" },
                { concept: "Rôle des ordres", rang: "B" },
                { concept: "Normes et valeurs", rang: "A" }
              ]
            },
            {
              type: "drag_drop",
              title: "Classez les 7 connaissances Rang A",
              items: [
                "Identifier professionnels",
                "Définition pratique médicale et éthique", 
                "Normes et valeurs",
                "Organisation et régulation",
                "EBM et responsabilité patient",
                "Déontologie et conflits",
                "Interactions interprofessionnelles"
              ]
            }
          ]
        },
        quiz_questions: COMPLETE_IC2_QUIZ,
        reward_messages: {
          completion: "Excellent ! Vous maîtrisez parfaitement les 9 connaissances IC-2 selon E-LiSA.",
          badges: ["Expert IC-2", "Valeurs professionnelles", "E-LiSA validé", "Déontologie maîtrisée"],
          next_steps: "Passez maintenant à IC-3 ou approfondissez avec des cas cliniques concrets."
        },
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'slug'
      });

    if (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      throw error;
    }

    console.log('✅ Item IC-2 mis à jour avec TOUS les éléments (tableaux 7A+2B, BD, paroles, quiz)');
    
    // Vérification finale
    const finalAudit = await runAndDisplayIC2Audit();
    
    console.log('\n🎯 VÉRIFICATION FINALE COMPLÈTE:');
    console.log(`📊 Complétude finale: ${finalAudit.completeness}%`);
    console.log(`📋 Rang A: ${finalAudit.rangA.found}/${finalAudit.rangA.expected} connaissances`);
    console.log(`🎯 Rang B: ${finalAudit.rangB.found}/${finalAudit.rangB.expected} connaissances`);
    
    if (finalAudit.completeness === 100) {
      console.log('🎉 Item IC-2 maintenant COMPLET à 100% avec TOUS les éléments selon E-LiSA !');
      console.log('✅ Tableaux: 7 Rang A + 2 Rang B');
      console.log('🎵 Paroles: Complètes avec refrains');
      console.log('🎯 Quiz: 5 questions détaillées');
      console.log('🎨 Bande dessinée: Structure complète avec 4 planches');
    } else {
      console.log('⚠️ Des éléments peuvent encore manquer...');
    }
    
    return finalAudit;
    
  } catch (error) {
    console.error('❌ Erreur lors de la complétion complète IC-2:', error);
    throw error;
  }
}

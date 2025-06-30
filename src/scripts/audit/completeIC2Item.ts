
import { supabase } from '@/integrations/supabase/client';
import { runAndDisplayIC2Audit } from './runIC2Audit';

// Contenu complet IC-2 selon E-LiSA officiel - 9 Rang A + 2 Rang B
const COMPLETE_IC2_CONTENT = {
  tableau_rang_a: {
    title: "Rang A - Connaissances fondamentales (9 concepts E-LiSA)",
    sections: [
      {
        title: "Identifier les professionnels, compétences et ressources liés à un rôle particulier dans une organisation de santé",
        content: "Cartographie complète des acteurs de santé : médecins spécialistes, généralistes, chirurgiens-dentistes, sages-femmes, pharmaciens, infirmiers, masseurs-kinésithérapeutes, pédicures-podologues selon leurs rôles organisationnels et compétences spécifiques.",
        keywords: ["professionnels", "compétences", "ressources", "organisation", "santé", "acteurs", "spécialistes", "généralistes"]
      },
      {
        title: "Connaître la définition de la pratique médicale",
        content: "La pratique médicale est une activité professionnelle du médecin intégrant diagnostic, traitement, prévention dans un cadre scientifique et relationnel structuré. Elle combine excellence technique et dimension humaine.",
        keywords: ["pratique médicale", "définition", "diagnostic", "traitement", "prévention", "scientifique", "relationnel"]
      },
      {
        title: "Connaître la signification de l'éthique",
        content: "L'éthique désigne la réflexion philosophique sur l'action juste et appropriée, questionnement moral face aux dilemmes de la pratique médicale. Elle guide la réflexion sans donner de réponses toutes faites.",
        keywords: ["éthique", "réflexion", "philosophique", "moral", "dilemmes", "questionnement"]
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
        title: "Connaître les principes de la médecine fondée sur les preuves",
        content: "Evidence-Based Medicine : approche médicale basée sur les meilleures preuves scientifiques disponibles, intégrée à l'expertise clinique. L'EBM combine rigueur scientifique et adaptation individuelle.",
        keywords: ["médecine fondée", "preuves", "evidence", "EBM", "scientifiques", "expertise", "clinique"]
      },
      {
        title: "Connaître les principes de déontologie médicale",
        content: "Ensemble des devoirs professionnels codifiés régissant l'exercice médical : code de déontologie, secret professionnel, obligation de soins, respect de la dignité, confraternité.",
        keywords: ["déontologie", "devoirs", "professionnels", "code", "secret", "obligation", "soins", "dignité"]
      },
      {
        title: "Connaître le concept de médecine basée sur la responsabilité et l'expérience du patient",
        content: "Approche médicale intégrant l'expérience vécue du patient, ses préférences et sa responsabilité dans les décisions de santé. Équilibre entre expertise médicale et autonomie du patient.",
        keywords: ["responsabilité", "expérience", "patient", "préférences", "autonomie", "décisions"]
      },
      {
        title: "Connaître les différents acteurs de la santé et leurs interactions",
        content: "Écosystème complexe d'acteurs : professionnels de santé, établissements, institutions, patients, familles, associations avec interactions multiples. Hôpitaux, cliniques, médecine de ville, EHPAD, HAD, associations de patients, ARS, CPAM.",
        keywords: ["acteurs", "santé", "interactions", "établissements", "institutions", "hôpitaux", "cliniques", "associations"]
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
        title: "Connaître le rôle des ordres professionnels",
        content: "Instances de régulation professionnelle : inscription, discipline, surveillance déontologique, organisation territoriale (départemental, régional, national). CNOM, conseils départementaux et régionaux, procédures disciplinaires.",
        keywords: ["ordres", "professionnels", "régulation", "discipline", "surveillance", "déontologique", "CNOM", "disciplinaires"]
      }
    ]
  }
};

// Paroles musicales complètes pour IC-2
const COMPLETE_IC2_PAROLES = [
  "Dans les couloirs blancs de l'hôpital moderne",
  "Résonnent les pas de ceux qui soignent et espèrent", 
  "Neuf connaissances guident leur noble mission",
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
  "Déontologie stricte, responsabilité claire",
  "Acteurs multiples dans l'univers sanitaire",
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
  "Onze connaissances, E-LiSA officiel",
  "Pour des soignants au cœur essentiel",
  "Valeurs professionnelles, éternelles et sûres",
  "Guident nos pas vers la médecine pure"
];

// Quiz questions complètes
const COMPLETE_IC2_QUIZ = {
  questions: [
    {
      question: "Combien de connaissances Rang A sont attendues pour IC-2 selon E-LiSA ?",
      options: ["7", "8", "9", "10"],
      correct: 2,
      explanation: "Selon le référentiel E-LiSA officiel, IC-2 comprend exactement 9 connaissances de Rang A."
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

export async function completeIC2Item() {
  console.log('🔧 Vérification et complétion complète de l\'item IC-2...');
  
  try {
    // D'abord, vérifier l'état actuel
    const auditReport = await runAndDisplayIC2Audit();
    
    if (auditReport.completeness === 100) {
      console.log('✅ Item IC-2 déjà complet à 100%');
      return auditReport;
    }
    
    console.log('🔧 Mise à jour COMPLÈTE du contenu IC-2 selon E-LiSA...');
    
    // Mise à jour complète de l'item IC-2 avec TOUS les éléments
    const { data, error } = await supabase
      .from('edn_items_immersive')
      .upsert({
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', // ID fixe pour IC-2
        slug: 'valeurs-professionnelles-medecin',
        item_code: 'IC-2',
        title: 'Les valeurs professionnelles du médecin et des autres professions de santé',
        subtitle: 'Fiche E-LiSA officielle - 11 connaissances (9 Rang A + 2 Rang B)',
        pitch_intro: 'Découvrez les 11 connaissances essentielles selon le référentiel E-LiSA officiel : valeurs cardinales, déontologie, organisation professionnelle et régulation étatique. Une exploration complète des principes éthiques et organisationnels qui fondent l\'exercice médical moderne.',
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
          scenario: "Une journée type dans le service illustrant concrètement chacune des 11 connaissances E-LiSA en action : consultation éthique, réunion interprofessionnelle, cas de déontologie, etc."
        },
        paroles_musicales: COMPLETE_IC2_PAROLES,
        interaction_config: {
          type: "comprehensive_learning",
          title: "Maîtrisez les 11 connaissances IC-2 selon E-LiSA",
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
              title: "Classez les 9 connaissances Rang A",
              items: [
                "Identifier professionnels",
                "Définition pratique médicale", 
                "Signification éthique",
                "Normes et valeurs",
                "Organisation et régulation",
                "Médecine fondée sur preuves",
                "Déontologie médicale",
                "Responsabilité patient",
                "Acteurs et interactions"
              ]
            }
          ]
        },
        quiz_questions: COMPLETE_IC2_QUIZ,
        reward_messages: {
          completion: "Excellent ! Vous maîtrisez parfaitement les 11 connaissances IC-2 selon E-LiSA.",
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

    console.log('✅ Item IC-2 mis à jour avec TOUS les éléments (tableaux, BD, paroles, quiz)');
    
    // Vérification finale
    const finalAudit = await runAndDisplayIC2Audit();
    
    console.log('\n🎯 VÉRIFICATION FINALE COMPLÈTE:');
    console.log(`📊 Complétude finale: ${finalAudit.completeness}%`);
    console.log(`📋 Rang A: ${finalAudit.rangA.found}/${finalAudit.rangA.expected} connaissances`);
    console.log(`🎯 Rang B: ${finalAudit.rangB.found}/${finalAudit.rangB.expected} connaissances`);
    
    if (finalAudit.completeness === 100) {
      console.log('🎉 Item IC-2 maintenant COMPLET à 100% avec TOUS les éléments selon E-LiSA !');
      console.log('✅ Tableaux: 9 Rang A + 2 Rang B');
      console.log('🎵 Paroles: Complètes avec refrains');
      console.log('🎯 Quiz: 5 questions détaillées');
      console.log('🎨 Bande dessinée: Structure prête');
    } else {
      console.log('⚠️ Des éléments peuvent encore manquer...');
    }
    
    return finalAudit;
    
  } catch (error) {
    console.error('❌ Erreur lors de la complétion complète IC-2:', error);
    throw error;
  }
}


import { supabase } from '@/integrations/supabase/client';
import { runAndDisplayIC2Audit } from './runIC2Audit';

// Contenu complet IC-2 selon E-LiSA officiel
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
        title: "Connaître les principes de la médecine basée sur la responsabilité et l'expérience du malade",
        content: "Approche médicale intégrant l'expérience vécue du patient, ses préférences et sa responsabilité dans les décisions de santé. Équilibre entre expertise médicale et autonomie du patient.",
        keywords: ["responsabilité", "expérience", "malade", "patient", "préférences", "autonomie", "décisions"]
      },
      {
        title: "Connaître les principes de déontologie médicale",
        content: "Ensemble des devoirs professionnels codifiés régissant l'exercice médical : code de déontologie, secret professionnel, obligation de soins, respect de la dignité, confraternité.",
        keywords: ["déontologie", "devoirs", "professionnels", "code", "secret", "obligation", "soins", "dignité"]
      },
      {
        title: "Connaître les différents acteurs de la santé et leurs interactions",
        content: "Écosystème complexe d'acteurs : professionnels de santé, établissements, institutions, patients, familles, associations avec interactions multiples. Hôpitaux, cliniques, médecine de ville, EHPAD, HAD, associations de patients, ARS, CPAM.",
        keywords: ["acteurs", "santé", "interactions", "établissements", "institutions", "hôpitaux", "cliniques", "associations"]
      }
    ]
  },
  tableau_rang_b: {
    title: "Rang B - Connaissances approfondies (3 concepts E-LiSA)",
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
      },
      {
        title: "Connaître les interactions entre acteurs",
        content: "Coordination entre tous les acteurs du système de santé : professionnels, établissements, institutions, patients, associations. Approche systémique nécessaire pour comprendre la complexité des interactions.",
        keywords: ["interactions", "coordination", "système", "établissements", "systémique", "complexité"]
      }
    ]
  }
};

export async function completeIC2Item() {
  console.log('🔧 Vérification et complétion de l\'item IC-2...');
  
  try {
    // D'abord, vérifier l'état actuel
    const auditReport = await runAndDisplayIC2Audit();
    
    if (auditReport.completeness === 100) {
      console.log('✅ Item IC-2 déjà complet à 100%');
      return auditReport;
    }
    
    console.log('🔧 Mise à jour du contenu IC-2 selon E-LiSA...');
    
    // Mise à jour de l'item IC-2
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
          scenario: "Une journée type dans le service illustrant concrètement chacune des 11 connaissances E-LiSA en action"
        },
        paroles_musicales: [
          "Dans les couloirs blancs de l'hôpital moderne",
          "Résonnent les pas de ceux qui soignent et espèrent",
          "Onze connaissances guident leur noble mission",
          "Valeurs, déontologie, organisation en fusion",
          "Du rang A fondamental au rang B approfondi",
          "Chaque professionnel porte en lui l'éthique et la vie",
          "Responsabilité, compassion, probité sincère",
          "Font de la médecine un art, une science claire"
        ],
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
                { concept: "Rôle des ordres", rang: "B" }
              ]
            }
          ]
        },
        quiz_questions: {
          questions: [
            {
              question: "Combien de connaissances Rang A sont attendues pour IC-2 selon E-LiSA ?",
              options: ["6", "7", "8", "9"],
              correct: 3,
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
            }
          ]
        },
        reward_messages: {
          completion: "Excellent ! Vous maîtrisez parfaitement les 11 connaissances IC-2 selon E-LiSA.",
          badges: ["Expert IC-2", "Valeurs professionnelles", "E-LiSA validé"],
          next_steps: "Passez maintenant à IC-3 ou approfondissez avec des cas cliniques."
        },
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'slug'
      });

    if (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      throw error;
    }

    console.log('✅ Item IC-2 mis à jour avec succès');
    
    // Vérification finale
    const finalAudit = await runAndDisplayIC2Audit();
    
    console.log('\n🎯 VÉRIFICATION FINALE:');
    console.log(`📊 Complétude finale: ${finalAudit.completeness}%`);
    
    if (finalAudit.completeness === 100) {
      console.log('🎉 Item IC-2 maintenant COMPLET à 100% selon E-LiSA !');
    } else {
      console.log('⚠️ Des éléments peuvent encore manquer...');
    }
    
    return finalAudit;
    
  } catch (error) {
    console.error('❌ Erreur lors de la complétion IC-2:', error);
    throw error;
  }
}

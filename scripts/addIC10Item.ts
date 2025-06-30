
/* addIC10Item.ts
   — Script d'insertion de l'item IC-10 dans Supabase —
*/

import { createClient } from '@supabase/supabase-js';
import { ItemEDNSchemaV2 } from '../src/schemas/itemEDNSchema';

// Connexion Supabase
const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

// Données IC-10 basées sur la documentation officielle
const IC10_DATA = {
  item_metadata: {
    code: 'IC-10',
    title: 'Approches transversales du corps',
    subtitle: 'Vision holistique et multidimensionnelle du corps humain',
    category: 'organisation_systeme',
    difficulty: 'AB' as const,
    version: 'v2.0.0',
    slug: 'ic-10-approches-transversales-corps',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  content: {
    rang_a: {
      theme: 'IC-10 Rang A - Dimensions fondamentales du corps',
      competences: [
        {
          competence_id: 'IC10A_DIMENSIONS_HUMAINES',
          concept: 'Dimensions humaines du corps',
          definition: 'Le corps est un objet d\'étude multidimensionnel comprenant les aspects physiques, psychiques, sociaux et culturels qui s\'articulent de manière complexe.',
          exemple: 'Prise en compte des habitudes alimentaires culturelles lors de l\'éducation nutritionnelle d\'un patient diabétique',
          piege: 'Réduire le corps à sa seule dimension biologique en négligeant les aspects psychosociaux',
          mnemo: 'CORPS : Culturel, Organique, Relationnel, Psychologique, Social',
          subtilite: 'Les dimensions s\'influencent mutuellement et ne peuvent être dissociées',
          application: 'Approche globale du patient intégrant toutes les dimensions corporelles',
          vigilance: 'Éviter le réductionnisme biomédical tout en maintenant la rigueur scientifique',
          paroles_chantables: [
            'Corps multidimensionnel, approche globale, physique et social, vision totale',
            'Biologique et culturel, psychique et social, corps complet, soin idéal'
          ]
        },
        {
          competence_id: 'IC10A_EXPERIENCE_CORPORELLE',
          concept: 'Expérience corporelle et conscience',
          definition: 'L\'expérience corporelle comprend la conscience immédiate et intime que nous avons de notre propre corps, incluant les sensations internes et la perception de soi.',
          exemple: 'Accompagnement d\'un patient amputé dans la reconstruction de son schéma corporel',
          piege: 'Sous-estimer l\'impact psychologique des modifications corporelles',
          mnemo: 'EXPÉRIENCE : Émotion, eXploration, Perception, Évaluation, Ressenti, Intégration, Écoute, Neurologie, Conscience, Empathie',
          subtilite: 'L\'expérience corporelle varie selon les individus et les contextes culturels',
          application: 'Techniques de reconnexion corporelle en rééducation et soins palliatifs',
          vigilance: 'Respecter l\'unicité de chaque expérience corporelle individuelle',
          paroles_chantables: [
            'Expérience unique, corps vécu, sensation profonde, être et paraître',
            'Conscience corporelle, identité réelle, schéma mental, harmonie nouvelle'
          ]
        },
        {
          competence_id: 'IC10A_IMPACT_MALADIES',
          concept: 'Impact des maladies sur l\'expérience corporelle',
          definition: 'Les maladies modifient profondément l\'expérience du corps en altérant l\'image corporelle, l\'estime de soi et les capacités fonctionnelles.',
          exemple: 'Accompagnement psychologique d\'une patiente après mastectomie pour cancer du sein',
          piege: 'Minimiser l\'impact psychologique des changements corporels liés à la maladie',
          mnemo: 'IMPACT : Image, Modification, Psychisme, Adaptation, Capacité, Transformation',
          subtilite: 'L\'impact varie selon la visibilité de la pathologie et le vécu antérieur du patient',
          application: 'Consultation d\'annonce incluant l\'accompagnement de l\'image corporelle',
          vigilance: 'Anticiper les difficultés d\'adaptation et proposer un soutien adapté',
          paroles_chantables: [
            'Maladie transforme, corps qui change, image nouvelle, soutien d\'accompagne',
            'Identité bousculée, corps modifié, adaptation guidée, espoir retrouvé'
          ]
        }
      ]
    },

    rang_b: {
      theme: 'IC-10 Rang B - Expertise des approches transversales',
      competences: [
        {
          competence_id: 'IC10B_PRATIQUES_CLINIQUES',
          concept: 'Intégration dans les pratiques cliniques',
          definition: 'Capacité experte à intégrer les approches transversales du corps dans l\'examen clinique, le diagnostic et les soins, en tenant compte de toutes les dimensions.',
          exemple: 'Consultation de médecine interne intégrant l\'évaluation psychosomatique systématique',
          piege: 'Se contenter d\'une approche superficielle sans réelle intégration clinique',
          mnemo: 'INTÉGRATION : Investigation, Neurologie, Thérapeutique, Évaluation, Globalité, Raisonnement, Analyse, Théorie, Investigation, Observation, Normalisation',
          subtilite: 'L\'intégration nécessite une formation continue et une pratique réflexive',
          application: 'Développement de grilles d\'évaluation multidimensionnelles',
          vigilance: 'Maintenir l\'équilibre entre approche globale et précision diagnostique',
          paroles_chantables: [
            'Pratique experte, vision complète, corps analysé, santé respectée',
            'Clinique globale, approche totale, diagnostic juste, thérapie ajustée'
          ]
        },
        {
          competence_id: 'IC10B_RECHERCHE_INNOVATION',
          concept: 'Recherche et innovation thérapeutique',
          definition: 'Participation à la recherche clinique intégrant les approches transversales et développement d\'innovations thérapeutiques holistiques.',
          exemple: 'Protocole de recherche évaluant l\'efficacité d\'une approche psychocorporelle en oncologie',
          piege: 'Négliger la rigueur scientifique au nom de l\'approche holistique',
          mnemo: 'RECHERCHE : Rigueur, Éthique, Créativité, Hypothèse, Évaluation, Résultats, Contrôle, Holisme, Evidence',
          subtilite: 'L\'innovation doit s\'appuyer sur des preuves scientifiques solides',
          application: 'Élaboration de protocoles de recherche interdisciplinaires',
          vigilance: 'Concilier ouverture aux approches alternatives et exigence scientifique',
          paroles_chantables: [
            'Recherche avancée, innovation sage, science et sagesse, nouveau message',
            'Preuves établies, approche validée, corps respecté, médecine renouvelée'
          ]
        }
      ]
    }
  },

  generation_config: {
    music_enabled: true,
    bd_enabled: true,
    quiz_enabled: true,
    interactive_enabled: true
  },

  ai_prompts: {
    music_prompt_base: 'Créer une chanson sur les approches transversales du corps humain, incluant les dimensions physiques, psychiques, sociales et culturelles',
    bd_prompt_base: 'Illustrer les différentes dimensions du corps humain dans le contexte médical avec une approche pédagogique',
    quiz_prompt_base: 'Générer des questions sur l\'approche multidimensionnelle du corps et son application clinique'
  }
};

// Validation et insertion
(async () => {
  try {
    // Validation du schéma
    const validationResult = ItemEDNSchemaV2.safeParse(IC10_DATA);
    
    if (!validationResult.success) {
      console.error('❌ Erreur de validation:', validationResult.error.errors);
      process.exit(1);
    }

    console.log('✅ Validation réussie');

    // Vérifier si l'item existe déjà
    const { data: existingItem } = await supabase
      .from('edn_items_immersive')
      .select('id')
      .eq('item_code', 'IC-10')
      .single();

    if (existingItem) {
      // Mise à jour
      const { error: updateError } = await supabase
        .from('edn_items_immersive')
        .update({
          payload_v2: IC10_DATA,
          title: IC10_DATA.item_metadata.title,
          subtitle: IC10_DATA.item_metadata.subtitle,
          slug: IC10_DATA.item_metadata.slug,
          updated_at: new Date().toISOString()
        })
        .eq('item_code', 'IC-10');

      if (updateError) {
        console.error('❌ Erreur de mise à jour:', updateError);
        process.exit(1);
      }

      console.log('✅ Item IC-10 mis à jour avec succès! 🎉');
    } else {
      // Insertion nouvelle
      const { error: insertError } = await supabase
        .from('edn_items_immersive')
        .insert({
          item_code: IC10_DATA.item_metadata.code,
          title: IC10_DATA.item_metadata.title,
          subtitle: IC10_DATA.item_metadata.subtitle,
          slug: IC10_DATA.item_metadata.slug,
          payload_v2: IC10_DATA,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('❌ Erreur d\'insertion:', insertError);
        process.exit(1);
      }

      console.log('✅ Item IC-10 inséré avec succès! 🎉');
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    process.exit(1);
  }
})();

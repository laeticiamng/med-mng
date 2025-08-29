import { useMemo } from 'react';

interface CompetenceAnalyzerProps {
  itemCode: string;
  title: string;
  tableau_rang_a?: any;
  tableau_rang_b?: any;
  competences_oic_rang_a?: any[];
  competences_oic_rang_b?: any[];
}

export const useCompetenceAnalyzer = ({ 
  itemCode, 
  title, 
  tableau_rang_a, 
  tableau_rang_b,
  competences_oic_rang_a,
  competences_oic_rang_b 
}: CompetenceAnalyzerProps) => {
  
  const competences = useMemo(() => {
    const competenceSet = new Set<string>();
    
    // Analyse basée sur l'item_code
    const codeAnalysis = {
      'CARDIO': ['Cardiologie', 'ECG', 'Pathologies cardiovasculaires'],
      'NEURO': ['Neurologie', 'Examen neurologique', 'Pathologies neurologiques'],
      'DERMATO': ['Dermatologie', 'Lésions cutanées', 'Diagnostic dermatologique'],
      'PNEUMO': ['Pneumologie', 'Pathologies respiratoires', 'Radiologie pulmonaire'],
      'GASTRO': ['Gastro-entérologie', 'Pathologies digestives', 'Endoscopie'],
      'NEPHRO': ['Néphrologie', 'Pathologies rénales', 'Dialyse'],
      'ENDOCRINO': ['Endocrinologie', 'Diabète', 'Pathologies hormonales'],
      'HEMATO': ['Hématologie', 'Pathologies sanguines', 'Hémogramme'],
      'INFECTIO': ['Infectiologie', 'Antibiothérapie', 'Pathologies infectieuses'],
      'URGENCE': ['Médecine d\'urgence', 'Réanimation', 'Gestes d\'urgence'],
      'PEDIATRIE': ['Pédiatrie', 'Pathologies pédiatriques', 'Développement enfant'],
      'GYNECO': ['Gynécologie', 'Obstétrique', 'Pathologies gynécologiques'],
      'PSYCHIATRIE': ['Psychiatrie', 'Pathologies psychiatriques', 'Psychothérapie'],
      'ORTHOPEDIE': ['Orthopédie', 'Traumatologie', 'Pathologies ostéo-articulaires'],
      'ORL': ['ORL', 'Pathologies ORL', 'Audiologie'],
      'OPHTALMO': ['Ophtalmologie', 'Pathologies oculaires', 'Fond d\'œil'],
      'ANESTHESIE': ['Anesthésie', 'Réanimation', 'Gestion de la douleur'],
      'CHIRURGIE': ['Chirurgie', 'Techniques chirurgicales', 'Post-opératoire'],
      'MEDECINE_GENERALE': ['Médecine générale', 'Prévention', 'Suivi patient'],
      'GERIATRIE': ['Gériatrie', 'Pathologies du sujet âgé', 'Polypathologie']
    };
    
    // Recherche par code exact ou substring
    Object.entries(codeAnalysis).forEach(([key, competenceList]) => {
      if (itemCode?.toUpperCase().includes(key)) {
        competenceList.forEach(comp => competenceSet.add(comp));
      }
    });
    
    // Analyse basée sur le titre
    const titleKeywords = {
      'cardiologie|cardio|cœur|cardiaque': ['Cardiologie', 'ECG', 'Insuffisance cardiaque'],
      'neurologie|neuro|cerveau|neurologique': ['Neurologie', 'Scanner cérébral', 'Reflexes'],
      'dermatologie|dermato|peau|cutané': ['Dermatologie', 'Lésions cutanées', 'Biopsie'],
      'pneumologie|pneumo|poumon|respiratoire': ['Pneumologie', 'Radiographie thoracique', 'Spirométrie'],
      'gastro|digestif|intestin|estomac': ['Gastro-entérologie', 'Endoscopie', 'Transit baryté'],
      'rein|néphro|urinaire': ['Néphrologie', 'Créatinine', 'Protéinurie'],
      'diabète|endocrino|hormone|thyroïde': ['Endocrinologie', 'Glycémie', 'Insulinothérapie'],
      'sang|hémato|anémie|leucémie': ['Hématologie', 'Hémogramme', 'Myélogramme'],
      'infection|bactérie|virus|antibioti': ['Infectiologie', 'Hémocultures', 'Antibiogramme'],
      'urgence|réanimation|choc': ['Médecine d\'urgence', 'Réanimation', 'État de choc'],
      'enfant|pédiatr|nouveau-né': ['Pédiatrie', 'Croissance', 'Vaccinations'],
      'femme|gynéco|grossesse|accouchement': ['Gynécologie-Obstétrique', 'Échographie', 'Suivi grossesse'],
      'psychiatr|psycho|dépression|anxiété': ['Psychiatrie', 'Entretien psychiatrique', 'Psychotropes'],
      'os|ortho|fracture|articulation': ['Orthopédie', 'Radiographie', 'Immobilisation'],
      'oreille|nez|gorge|orl': ['ORL', 'Otoscopie', 'Audiométrie'],
      'œil|ophtalmo|vision|rétine': ['Ophtalmologie', 'Fond d\'œil', 'Acuité visuelle'],
      'anesthésie|douleur|péridurale': ['Anesthésie-Réanimation', 'Analgésie', 'Intubation'],
      'chirurgie|opération|bloc': ['Chirurgie', 'Asepsie', 'Sutures'],
      'médecin généraliste|médecine générale': ['Médecine générale', 'Consultation', 'Prévention'],
      'personne âgée|gériatr|démence': ['Gériatrie', 'Évaluation gériatrique', 'Dépendance']
    };
    
    Object.entries(titleKeywords).forEach(([pattern, competenceList]) => {
      const regex = new RegExp(pattern, 'i');
      if (title && regex.test(title)) {
        competenceList.forEach(comp => competenceSet.add(comp));
      }
    });
    
    // Analyse des données OIC
    if (competences_oic_rang_a?.length || competences_oic_rang_b?.length) {
      competenceSet.add('Compétences OIC');
      competenceSet.add('Formation médicale');
    }
    
    // Compétences selon le rang
    if (tableau_rang_a) {
      ['Diagnostic différentiel', 'Anamnèse', 'Examen clinique', 'Sémiologie'].forEach(comp => 
        competenceSet.add(comp)
      );
    }
    
    if (tableau_rang_b) {
      ['Prise en charge thérapeutique', 'Suivi patient', 'Éducation thérapeutique', 'Pronostic'].forEach(comp => 
        competenceSet.add(comp)
      );
    }
    
    // Compétences transversales toujours présentes
    ['Communication médicale', 'Raisonnement clinique', 'Evidence-based medicine'].forEach(comp => 
      competenceSet.add(comp)
    );
    
    // Si aucune compétence spécifique identifiée, ajouter des compétences par défaut
    if (competenceSet.size <= 3) {
      ['Médecine générale', 'Diagnostic', 'Thérapeutique', 'Prévention'].forEach(comp => 
        competenceSet.add(comp)
      );
    }
    
    return Array.from(competenceSet).slice(0, 8); // Limiter à 8 compétences max
  }, [itemCode, title, tableau_rang_a, tableau_rang_b, competences_oic_rang_a, competences_oic_rang_b]);
  
  const getPrimaryCompetence = () => competences[0] || 'Médecine générale';
  
  const getCompetencesByCategory = () => {
    const categories = {
      'Spécialités médicales': competences.filter(c => 
        ['Cardiologie', 'Neurologie', 'Dermatologie', 'Pneumologie', 'Gastro-entérologie'].includes(c)
      ),
      'Compétences cliniques': competences.filter(c => 
        ['Diagnostic', 'Anamnèse', 'Examen clinique', 'Sémiologie'].includes(c)
      ),
      'Compétences thérapeutiques': competences.filter(c => 
        ['Thérapeutique', 'Suivi patient', 'Éducation thérapeutique'].includes(c)
      ),
      'Compétences transversales': competences.filter(c => 
        ['Communication', 'Raisonnement clinique', 'Evidence-based medicine'].includes(c)
      )
    };
    
    return categories;
  };
  
  return {
    competences,
    primaryCompetence: getPrimaryCompetence(),
    competencesByCategory: getCompetencesByCategory(),
    totalCount: competences.length
  };
};
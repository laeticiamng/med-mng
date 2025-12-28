import { useEffect } from 'react';
import { BandeDessineeComplete } from './BandeDessineeComplete';
import { ValeursProfessionnellesBD } from './ValeursProfessionnellesBD';
import { useActivityTracking } from '@/hooks/useActivityTracking';

interface TableauRangData {
  sections?: Array<{
    title?: string;
    content?: string;
    keywords?: string[];
    concepts?: unknown[];
    competences?: unknown[];
  }>;
  competences_cles?: unknown[];
}

interface BandeDessineeProps {
  itemData: {
    title: string;
    subtitle: string;
    slug?: string;
    item_code?: string;
    tableau_rang_a?: TableauRangData;
    tableau_rang_b?: TableauRangData;
  };
}

export const BandeDessinee = ({ itemData }: BandeDessineeProps) => {
  const { logActivity } = useActivityTracking();

  useEffect(() => {
    logActivity({ activity_type: 'study', metadata: { action: 'view_bande_dessinee', itemCode: itemData.item_code, slug: itemData.slug } });
  }, [itemData.item_code, itemData.slug, logActivity]);

  // Si c'est l'item sur les valeurs professionnelles, utiliser le composant spécialisé
  if (itemData.slug === 'valeurs-professionnelles-medecin') {
    return <ValeursProfessionnellesBD itemData={itemData} />;
  }

  // Utiliser le nouveau composant complet pour tous les autres items
  return <BandeDessineeComplete itemData={itemData} />;
};


import { BandeDessineeComplete } from './BandeDessineeComplete';
import { ValeursProfessionnellesBD } from './ValeursProfessionnellesBD';

interface BandeDessineeProps {
  itemData: {
    title: string;
    subtitle: string;
    slug?: string;
    item_code?: string;
    tableau_rang_a?: any;
    tableau_rang_b?: any;
  };
}

export const BandeDessinee = ({ itemData }: BandeDessineeProps) => {
  // Si c'est l'item sur les valeurs professionnelles, utiliser le composant spécialisé
  if (itemData.slug === 'valeurs-professionnelles-medecin') {
    return <ValeursProfessionnellesBD itemData={itemData} />;
  }

  // Utiliser le nouveau composant complet pour tous les autres items
  return <BandeDessineeComplete itemData={itemData} />;
};

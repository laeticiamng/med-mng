
import { BandeDessineeStatique } from './BandeDessineeStatique';

interface BandeDessineeProps {
  itemData: {
    title: string;
    subtitle: string;
    tableau_rang_a?: any;
    tableau_rang_b?: any;
  };
}

export const BandeDessinee = ({ itemData }: BandeDessineeProps) => {
  return <BandeDessineeStatique itemData={itemData} />;
};

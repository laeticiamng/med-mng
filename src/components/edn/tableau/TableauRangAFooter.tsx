
interface TableauRangAFooterProps {
  totalLignes: number;
  itemCode: string;
  theme: string;
}

export const TableauRangAFooter = ({ totalLignes, itemCode, theme }: TableauRangAFooterProps) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="text-center text-sm text-blue-700">
        <div className="font-medium mb-1">
          Tableau Rang A complet - {totalLignes} compétence{totalLignes > 1 ? 's' : ''} fondamentale{totalLignes > 1 ? 's' : ''}
        </div>
        <div className="text-blue-600">
          Item <span className="font-medium">{itemCode}</span> • 
          {theme} • 
          Conformité E-LiSA 2024
        </div>
      </div>
    </div>
  );
};

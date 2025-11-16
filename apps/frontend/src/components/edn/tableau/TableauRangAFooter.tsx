
interface TableauRangAFooterProps {
  colonnesCount: number;
  lignesCount: number;
}

export const TableauRangAFooter = ({ colonnesCount, lignesCount }: TableauRangAFooterProps) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="text-center text-sm text-blue-700">
        <div className="font-medium mb-1">
          Tableau Rang A complet - {lignesCount} compétence{lignesCount > 1 ? 's' : ''} fondamentale{lignesCount > 1 ? 's' : ''}
        </div>
        <div className="text-blue-600">
          {colonnesCount} dimensions analysées • 
          Conformité E-LiSA 2024
        </div>
      </div>
    </div>
  );
};

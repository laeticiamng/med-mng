
interface TableauRangAHeaderProps {
  theme: string;
  itemCode: string;
  totalCompetences: number;
}

export const TableauRangAHeader = ({ theme, itemCode, totalCompetences }: TableauRangAHeaderProps) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2">
            📋 Rang A - Connaissances Fondamentales
          </h2>
          <p className="text-blue-100 text-lg">
            {theme}
          </p>
          <div className="flex items-center gap-4 mt-3 text-sm text-blue-200">
            <span>Item {itemCode}</span>
            <span>•</span>
            <span>{totalCompetences} compétence{totalCompetences > 1 ? 's' : ''} attendue{totalCompetences > 1 ? 's' : ''}</span>
            <span>•</span>
            <span>Niveau fondamental selon E-LiSA</span>
          </div>
        </div>
        <div className="bg-blue-500 bg-opacity-50 px-4 py-2 rounded-lg">
          <div className="text-2xl font-bold">{totalCompetences}</div>
          <div className="text-xs text-blue-200">Compétences</div>
        </div>
      </div>
    </div>
  );
};

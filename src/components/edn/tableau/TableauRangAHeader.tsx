
interface TableauRangAHeaderProps {
  theme: string;
  itemCode: string;
  totalCompetences: number;
}

export const TableauRangAHeader = ({ theme, itemCode, totalCompetences }: TableauRangAHeaderProps) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-6 rounded-lg mx-2 sm:mx-0">
      <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg sm:text-2xl font-bold mb-2">
            📋 Rang A - Connaissances Fondamentales
          </h2>
          <p className="text-blue-100 text-sm sm:text-lg leading-tight">
            {theme}
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 text-xs sm:text-sm text-blue-200">
            <span>Item {itemCode}</span>
            <span className="hidden sm:inline">•</span>
            <span>{totalCompetences} compétence{totalCompetences > 1 ? 's' : ''}</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Niveau fondamental selon E-LiSA</span>
          </div>
        </div>
        <div className="bg-blue-500 bg-opacity-50 px-3 py-2 sm:px-4 sm:py-2 rounded-lg flex-shrink-0 self-start sm:self-auto">
          <div className="text-lg sm:text-2xl font-bold text-center">{totalCompetences}</div>
          <div className="text-xs text-blue-200 text-center">Compétences</div>
        </div>
      </div>
    </div>
  );
};

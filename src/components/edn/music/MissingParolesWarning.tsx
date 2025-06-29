
import { AlertTriangle } from 'lucide-react';

interface MissingParolesWarningProps {
  isVisible: boolean;
}

export const MissingParolesWarning = ({ isVisible }: MissingParolesWarningProps) => {
  if (!isVisible) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center">
      <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0" />
      <div className="text-yellow-800">
        <p className="font-medium">Paroles manquantes</p>
        <p className="text-sm">Les paroles pour ce rang ne sont pas encore disponibles dans la base de données MED MNG.</p>
      </div>
    </div>
  );
};

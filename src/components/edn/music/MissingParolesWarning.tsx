
import { AlertTriangle } from 'lucide-react';

interface MissingParolesWarningProps {
  isVisible: boolean;
}

export const MissingParolesWarning = ({ isVisible }: MissingParolesWarningProps) => {
  if (!isVisible) return null;

  return (
    <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6 flex items-center">
      <AlertTriangle className="h-5 w-5 text-warning mr-3 flex-shrink-0" />
      <div className="text-foreground">
        <p className="font-medium">Paroles manquantes</p>
        <p className="text-sm text-muted-foreground">Les paroles pour ce rang ne sont pas encore disponibles dans la base de données MED MNG.</p>
      </div>
    </div>
  );
};

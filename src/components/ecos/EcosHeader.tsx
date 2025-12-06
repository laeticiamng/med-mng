
import { Link } from 'react-router-dom';
import { Stethoscope, ArrowLeft, Clock } from 'lucide-react';
import { ROUTE_PATHS } from '@/config/routes';

interface EcosHeaderProps {
  timeLeft: number;
  formatTime: (seconds: number) => string;
  scenarioId: string;
  specialty: string;
}

export const EcosHeader = ({ timeLeft, formatTime, scenarioId, specialty }: EcosHeaderProps) => {
  return (
    <div className="bg-muted/20 backdrop-blur-sm border-b border-border/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to={ROUTE_PATHS.ecosIndex} className="flex items-center gap-3 text-foreground hover:text-success transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <Stethoscope className="h-6 w-6" />
            <span className="font-semibold">Retour aux ECOS</span>
          </Link>
          <div className="flex items-center gap-4 text-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="font-mono">{formatTime(timeLeft)}</span>
            </div>
            <div className="text-success">
              {scenarioId} • {specialty}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

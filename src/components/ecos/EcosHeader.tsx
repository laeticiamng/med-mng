
import { Link } from 'react-router-dom';
import { Stethoscope, ArrowLeft, Clock, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EcosHeaderProps {
  timeLeft: number;
  formatTime: (seconds: number) => string;
  scenarioId: string;
  specialty: string;
  onExportPdf?: () => void;
  isExporting?: boolean;
}

export const EcosHeader = ({
  timeLeft,
  formatTime,
  scenarioId,
  specialty,
  onExportPdf,
  isExporting,
}: EcosHeaderProps) => {
  return (
    <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link to="/ecos" className="flex items-center gap-3 text-white hover:text-emerald-300 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <Stethoscope className="h-6 w-6" />
            <span className="font-semibold">Retour aux ECOS</span>
          </Link>
          <div className="flex items-center gap-4 text-white">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="font-mono">{formatTime(timeLeft)}</span>
            </div>
            <div className="text-emerald-300">
              {scenarioId} • {specialty}
            </div>
            {onExportPdf ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onExportPdf}
                disabled={isExporting}
                className="print:hidden gap-2"
              >
                <FileDown className="h-4 w-4" aria-hidden />
                {isExporting ? 'Préparation…' : 'Exporter PDF'}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

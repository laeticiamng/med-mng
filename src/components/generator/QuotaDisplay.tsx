import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Music } from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';

interface QuotaDisplayProps {
  user: any;
  remainingFree: number;
  maxFreeGenerations: number;
  musicQuota: any;
  getUsageDisplay: () => string;
}

export const QuotaDisplay: React.FC<QuotaDisplayProps> = ({
  user,
  remainingFree,
  maxFreeGenerations,
  musicQuota,
  getUsageDisplay
}) => {
  if (!user && remainingFree > 0) {
    return (
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-success/10 to-success/5 px-8 py-4 rounded-2xl border border-success/20 shadow-lg shadow-success/10">
          <Music className="h-6 w-6 text-success" />
          <span className="text-success font-bold text-lg">
            <TranslatedText text={`${remainingFree}/${maxFreeGenerations} générations gratuites restantes`} />
          </span>
        </div>
      </div>
    );
  }

  if (user && musicQuota) {
    return (
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-primary/10 to-primary/5 px-8 py-4 rounded-2xl border border-primary/20 shadow-lg shadow-primary/10">
          <Music className="h-6 w-6 text-primary" />
          <span className="text-primary font-bold text-lg">
            {getUsageDisplay()}
          </span>
          {!musicQuota.can_generate && (
            <Badge variant="secondary" className="bg-destructive/10 text-destructive">
              Quota atteint
            </Badge>
          )}
        </div>
      </div>
    );
  }

  return null;
};
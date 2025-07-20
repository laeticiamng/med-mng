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
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-100 to-emerald-100 px-8 py-4 rounded-2xl border border-green-200/50 shadow-lg shadow-green-500/10">
          <Music className="h-6 w-6 text-green-700" />
          <span className="text-green-800 font-bold text-lg">
            <TranslatedText text={`${remainingFree}/${maxFreeGenerations} générations gratuites restantes`} />
          </span>
        </div>
      </div>
    );
  }

  if (user && musicQuota) {
    return (
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-100 to-indigo-100 px-8 py-4 rounded-2xl border border-blue-200/50 shadow-lg shadow-blue-500/10">
          <Music className="h-6 w-6 text-blue-700" />
          <span className="text-blue-800 font-bold text-lg">
            {getUsageDisplay()}
          </span>
          {!musicQuota.can_generate && (
            <Badge variant="secondary" className="bg-red-100 text-red-800">
              Quota atteint
            </Badge>
          )}
        </div>
      </div>
    );
  }

  return null;
};

import { Badge } from '@/components/ui/badge';

interface PitchIntroSectionProps {
  title: string;
  itemCode: string;
  subtitle: string;
  pitchIntro: string;
}

export const PitchIntroSection = ({ title, itemCode, subtitle, pitchIntro }: PitchIntroSectionProps) => {
  return (
    <div className="text-center space-y-6">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-200/30 to-blue-200/30 rounded-full blur-3xl animate-pulse" />
        <h1 className="relative text-4xl font-serif text-amber-900 mb-4">{title}</h1>
      </div>
      <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">
        {itemCode} - {subtitle}
      </Badge>
      <div className="max-w-3xl mx-auto">
        <p className="text-lg text-amber-800 leading-relaxed font-medium italic">
          "{pitchIntro}"
        </p>
      </div>
    </div>
  );
};

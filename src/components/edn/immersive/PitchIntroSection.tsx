
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
        <div className="absolute inset-0 bg-gradient-to-r from-warning/30 to-primary/30 rounded-full blur-3xl animate-pulse" />
        <h1 className="relative text-4xl font-serif text-warning-foreground mb-4">{title}</h1>
      </div>
      <Badge variant="outline" className="text-warning border-warning/30 bg-warning/10">
        {itemCode} - {subtitle}
      </Badge>
      <div className="max-w-3xl mx-auto">
        <p className="text-lg text-warning-foreground/80 leading-relaxed font-medium italic">
          "{pitchIntro}"
        </p>
      </div>
    </div>
  );
};

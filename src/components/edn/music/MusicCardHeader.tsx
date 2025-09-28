
import { Music } from 'lucide-react';

interface MusicCardHeaderProps {
  title: string;
  iconColor: string;
  textColor: string;
}

export const MusicCardHeader = ({ title, iconColor, textColor }: MusicCardHeaderProps) => {
  return (
    <div className="text-center mb-6">
      <div className="flex items-center justify-center mb-4">
        <Music className={`h-6 w-6 ${iconColor} mr-3`} />
        <h3 className={`text-2xl font-serif ${textColor} font-bold`}>
          {title}
        </h3>
      </div>
    </div>
  );
};

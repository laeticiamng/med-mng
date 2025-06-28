
interface ParolesDisplayProps {
  parolesArray: string[];
  rang: 'A' | 'B';
  textColor: string;
}

export const ParolesDisplay = ({ parolesArray, rang, textColor }: ParolesDisplayProps) => {
  return (
    <div className={`prose prose-lg max-w-none ${textColor} mb-8`}>
      {parolesArray.map((ligne, index) => {
        if (ligne.startsWith('[') && ligne.endsWith(']')) {
          return (
            <div key={index} className={`text-xl font-bold ${rang === 'A' ? 'text-amber-800' : 'text-blue-800'} my-4 text-center`}>
              {ligne}
            </div>
          );
        }
        if (ligne.includes(' - ')) {
          return (
            <div key={index} className={`text-2xl font-bold ${textColor} mb-6 text-center border-b-2 ${rang === 'A' ? 'border-amber-300' : 'border-blue-300'} pb-3`}>
              {ligne}
            </div>
          );
        }
        return (
          <div key={index} className="text-lg leading-relaxed mb-2 italic font-medium">
            {ligne}
          </div>
        );
      })}
    </div>
  );
};

import React, { useMemo } from 'react';

interface ParolesDisplayProps {
  parolesArray: string[];
  rang: 'A' | 'B' | 'AB';
  textColor: string;
}

// Détection simple de lignes corrompues (accents manquants, mots éclatés, placeholders)
const corruptionPatterns: RegExp[] = [
  /conna\s*tre/i, // "Conna tre" -> Connaître
  /d\s*finition/i, // "D finition" -> Définition
  /qualit\s*curit/i, // "qualit curit" -> qualité sécurité
  /m\s*decin/i, // "m decin" -> médecin
  /am\s*lior/i, // "am lioration" -> amélioration
  /pr\s*cautions/i, // "Pr cautions" -> Précautions
  /transparencer/i // transparencer -> transparence
];

const isCorruptedLine = (line: string) => corruptionPatterns.some((rx) => rx.test(line));

const cleanParoles = (arr: string[]): string[] => {
  if (!Array.isArray(arr)) return [];
  const trimmed = arr
    .map((l) => (typeof l === 'string' ? l.replace(/\s+/g, ' ').trim() : ''))
    .filter((l) => l.length > 0);

  // Supprimer les doublons consécutifs et lignes corrompues
  const result: string[] = [];
  for (const l of trimmed) {
    if (isCorruptedLine(l)) continue;
    if (result.length === 0 || result[result.length - 1].toLowerCase() !== l.toLowerCase()) {
      result.push(l);
    }
  }

  // Limiter à 60 lignes pour garder la lisibilité
  return result.slice(0, 60);
};

export const ParolesDisplay = ({ parolesArray, rang, textColor }: ParolesDisplayProps) => {
  const lines = useMemo(() => cleanParoles(parolesArray), [parolesArray]);

  if (!lines.length) {
    return (
      <div className={`prose prose-lg max-w-none ${textColor} mb-8`}>
        <div className="text-sm opacity-80 italic">Paroles indisponibles pour ce rang. Veuillez régénérer.</div>
      </div>
    );
  }

  return (
    <div className={`prose prose-lg max-w-none ${textColor} mb-8`}>
      {lines.map((ligne, index) => {
        if (ligne.startsWith('[') && ligne.endsWith(']')) {
          return (
            <div
              key={index}
              className={`text-xl font-bold ${rang === 'AB' ? 'text-purple-800' : rang === 'A' ? 'text-amber-800' : 'text-blue-800'} my-4 text-center`}
            >
              {ligne}
            </div>
          );
        }
        if (ligne.includes(' - ')) {
          return (
            <div
              key={index}
              className={`text-2xl font-bold ${textColor} mb-6 text-center border-b-2 ${
                rang === 'AB' ? 'border-purple-300' : rang === 'A' ? 'border-amber-300' : 'border-blue-300'
              } pb-3`}
            >
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

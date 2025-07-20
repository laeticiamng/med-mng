
export const formatParoles = (text: string) => {
  if (!text || text === 'Aucune parole disponible pour le Rang A' || text === 'Aucune parole disponible pour le Rang B') {
    return ['Aucune parole disponible pour ce rang.'];
  }
  
  return text
    .replace(/\\n/g, '\n')
    .replace(/\n\n+/g, '\n\n')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
};

export const hasValidParoles = (parolesArray: string[]) => {
  return parolesArray.length > 0 && parolesArray[0] !== 'Aucune parole disponible pour ce rang.';
};

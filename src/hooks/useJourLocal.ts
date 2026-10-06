import { useEffect, useState } from 'react';
import { jourLocal, prochainMinuitLocal } from '@/lib/jourLocal';

/**
 * Jour local courant ('AAAA-MM-JJ'), qui change à minuit LOCAL même si la page reste ouverte
 * (un minuteur est programmé jusqu'au prochain minuit local, juste aussi les jours de 23 h ou 25 h).
 */
export function useJourLocal(): string {
  const [jour, setJour] = useState(() => jourLocal());
  const [relance, setRelance] = useState(0);

  useEffect(() => {
    const delai = Math.max(0, prochainMinuitLocal().getTime() - Date.now()) + 50;
    const minuteur = setTimeout(() => {
      const maintenant = jourLocal();
      if (maintenant !== jour) setJour(maintenant);
      else setRelance((n) => n + 1); // horloge en avance ou réveil anticipé : on reprogramme
    }, delai);
    return () => clearTimeout(minuteur);
  }, [jour, relance]);

  return jour;
}

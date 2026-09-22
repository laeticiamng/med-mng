import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * L'image d'une case de BD, dessinée d'après SA description (et non une photo
 * de stock tirée au hasard). Dessinée une seule fois, à la première lecture,
 * puis conservée : l'adresse dépend du texte de la description, donc une case
 * réécrite reçoit une nouvelle image.
 */
const BUCKET = 'bd-illustrations';

async function empreinte(texte: string): Promise<string> {
  const octets = new TextEncoder().encode(texte);
  const h = await crypto.subtle.digest('SHA-1', octets);
  return Array.from(new Uint8Array(h)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

export const cheminIllustration = async (itemCode: string, illustration: string) =>
  `${itemCode}/${await empreinte(illustration.trim())}.png`;

export function IllustrationCase({
  itemCode,
  illustration,
  titre,
  className = '',
  miniature = false,
}: {
  itemCode: string;
  illustration?: string | null;
  titre: string;
  className?: string;
  miniature?: boolean;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [etat, setEtat] = useState<'attente' | 'pret' | 'dessin' | 'echec'>('attente');

  useEffect(() => {
    let annule = false;
    setUrl(null);
    setEtat('attente');
    if (!illustration) {
      setEtat('echec');
      return;
    }
    (async () => {
      const chemin = await cheminIllustration(itemCode, illustration);
      const publique = supabase.storage.from(BUCKET).getPublicUrl(chemin).data.publicUrl;
      const existe = await fetch(publique, { method: 'HEAD' }).then((r) => r.ok).catch(() => false);
      if (annule) return;
      if (existe) {
        setUrl(publique);
        setEtat('pret');
        return;
      }
      if (miniature) return; // on ne dessine qu'à la lecture de la case, pas pour les vignettes
      setEtat('dessin');
      const { data, error } = await supabase.functions.invoke('illustrer-case', { body: { itemCode, illustration } });
      if (annule) return;
      if (error || !data?.url) {
        setEtat('echec');
        return;
      }
      setUrl(data.url);
      setEtat('pret');
    })();
    return () => {
      annule = true;
    };
  }, [itemCode, illustration, miniature]);

  if (url) return <img src={url} alt={illustration ?? titre} loading="lazy" className={`${className} object-cover bg-muted`} />;

  // En attendant (ou sans image) : la scène décrite, pour que la case reste lisible.
  return (
    <div className={`${className} flex items-center justify-center bg-gradient-to-br from-amber-50 to-sky-50 dark:from-slate-800 dark:to-slate-900 p-4 text-center`}>
      {miniature ? (
        <span className="text-[10px] leading-tight text-muted-foreground line-clamp-4">{titre}</span>
      ) : (
        <div className="max-w-md space-y-2">
          <p className="text-sm italic text-muted-foreground">{illustration ?? titre}</p>
          {etat === 'dessin' && <p className="text-xs text-muted-foreground animate-pulse">Dessin de la case en cours… (une quinzaine de secondes, une seule fois)</p>}
        </div>
      )}
    </div>
  );
}

export default IllustrationCase;

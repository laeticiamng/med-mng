import { Request, Response, NextFunction } from 'express';
import { supabase } from '../integrations/supabase/client';

export async function getEdnMusic(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { slug, rang } = req.params as { slug?: string; rang?: string };
    if (!slug || !rang) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    const rangKey = rang.toUpperCase();
    if (!['A', 'B', 'AB'].includes(rangKey)) {
      return res.status(400).json({ error: 'Invalid rang' });
    }

    const { data, error } = await supabase
      .from('edn_items_immersive')
      .select('paroles_musicales')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const paroles: string[] | null = data.paroles_musicales;
    if (!paroles || paroles.length === 0) {
      return res.status(404).json({ error: 'No lyrics found' });
    }

    let lyrics = '';
    if (rangKey === 'A') lyrics = paroles[0] || '';
    else if (rangKey === 'B') lyrics = paroles[1] || '';
    else lyrics = [paroles[0] || '', paroles[1] || ''].join('\n');

    return res.json({ slug, rang: rangKey, lyrics });
  } catch (err) {
    next(err);
  }
}

import { describe, expect, it } from 'vitest';
import { masquerJetons, masquerTexte } from '../lib/sentryMasquage';

const SECRET = 'SECRET-xyz_123';

describe('masquerTexte', () => {
  it.each(['token_hash', 'access_token', 'refresh_token', 'code'])('masque %s dans la query string et le fragment', (cle) => {
    expect(masquerTexte(`https://medmng.com/p?${cle}=${SECRET}&a=1`)).toBe(`https://medmng.com/p?${cle}=[masque]&a=1`);
    expect(masquerTexte(`https://medmng.com/p#${cle}=${SECRET}&type=recovery`)).toBe(`https://medmng.com/p#${cle}=[masque]&type=recovery`);
    expect(masquerTexte(`https://medmng.com/p?a=1&${cle}=${SECRET}`)).toBe(`https://medmng.com/p?a=1&${cle}=[masque]`);
  });

  it('ne touche ni les autres paramètres ni les mots qui contiennent « code »', () => {
    const url = 'https://medmng.com/p?error_code=otp_expired&zipcode=75001&type=recovery';
    expect(masquerTexte(url)).toBe(url);
  });
});

describe('masquerJetons (beforeSend / beforeBreadcrumb)', () => {
  it('masque request.url, query_string, Referer, transaction et message d’un évènement', () => {
    const evenement = masquerJetons({
      transaction: `/med-mng/reset-password#token_hash=${SECRET}&type=recovery`,
      message: `échec sur /cb?code=${SECRET}`,
      request: {
        url: `https://medmng.com/med-mng/reset-password#token_hash=${SECRET}&type=recovery`,
        query_string: `access_token=${SECRET}&refresh_token=${SECRET}`,
        headers: { Referer: `https://medmng.com/x?token_hash=${SECRET}`, 'User-Agent': 'x' },
      },
      tags: { u: 'ok' },
    });
    expect(JSON.stringify(evenement)).not.toContain(SECRET);
    expect(evenement.request.url).toBe('https://medmng.com/med-mng/reset-password#token_hash=[masque]&type=recovery');
    expect(evenement.request.headers['User-Agent']).toBe('x');
    expect(evenement.tags.u).toBe('ok');
  });

  it('masque les fils d’Ariane de navigation et de requêtes (from, to, url)', () => {
    const nav = masquerJetons({ category: 'navigation', data: { from: '/a', to: `/med-mng/reset-password#token_hash=${SECRET}&type=recovery` } });
    const requete = masquerJetons({ category: 'fetch', data: { url: `https://x.supabase.co/auth/v1/verify?token_hash=${SECRET}&type=recovery`, method: 'POST' } });
    expect(JSON.stringify([nav, requete])).not.toContain(SECRET);
    expect(requete.data.method).toBe('POST');
  });

  it('masque aussi les évènements imbriqués (breadcrumbs d’un évènement) et la forme objet', () => {
    const evenement = masquerJetons({
      breadcrumbs: [{ data: { to: `/p#access_token=${SECRET}` } }],
      request: { query_string: { token_hash: SECRET, a: '1' } },
      extra: { profond: { encore: [`?refresh_token=${SECRET}`] } },
    });
    expect(JSON.stringify(evenement)).not.toContain(SECRET);
    expect(evenement.request.query_string).toEqual({ token_hash: '[masque]', a: '1' });
  });

  it('valeurs non textuelles et cycles : aucun plantage', () => {
    const cyclique: Record<string, unknown> = { n: 1, nul: null, vrai: true };
    cyclique.soi = cyclique;
    expect(() => masquerJetons(cyclique)).not.toThrow();
    expect(masquerJetons(null)).toBeNull();
    expect(masquerJetons(42)).toBe(42);
  });
});

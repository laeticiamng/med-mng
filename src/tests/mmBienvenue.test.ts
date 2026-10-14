import { describe, expect, it } from 'vitest';
import {
  avecMarqueBienvenue,
  bienvenueDejaEnvoyee,
  CLE_BIENVENUE_ENVOYEE,
} from '../../supabase/functions/_shared/mm-bienvenue';

/** QA du 14.10.2026 : demandes répétées de l'e-mail de bienvenue (429 à la 3e). */
describe('marque « e-mail de bienvenue déjà envoyé »', () => {
  it('absente, vide ou mal typée : pas encore envoyé', () => {
    expect(bienvenueDejaEnvoyee(undefined)).toBe(false);
    expect(bienvenueDejaEnvoyee(null)).toBe(false);
    expect(bienvenueDejaEnvoyee({ provider: 'email' })).toBe(false);
    expect(bienvenueDejaEnvoyee({ [CLE_BIENVENUE_ENVOYEE]: '' })).toBe(false);
    expect(bienvenueDejaEnvoyee({ [CLE_BIENVENUE_ENVOYEE]: true })).toBe(false);
  });

  it('une fois posée, la marque est reconnue', () => {
    const meta = avecMarqueBienvenue({ provider: 'email' }, new Date('2026-10-14T14:20:32Z'));
    expect(bienvenueDejaEnvoyee(meta)).toBe(true);
    expect(meta[CLE_BIENVENUE_ENVOYEE]).toBe('2026-10-14T14:20:32.000Z');
  });

  it("conserve l'app_metadata existant (autres services partageant la connexion)", () => {
    const meta = avecMarqueBienvenue({ provider: 'email', providers: ['email'], role_emotionscare: 'x' });
    expect(meta.provider).toBe('email');
    expect(meta.providers).toEqual(['email']);
    expect(meta.role_emotionscare).toBe('x');
  });

  it('ne modifie pas l\'objet reçu', () => {
    const origine = { provider: 'email' };
    avecMarqueBienvenue(origine);
    expect(origine).toEqual({ provider: 'email' });
  });
});

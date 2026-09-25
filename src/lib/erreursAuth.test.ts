import { describe, expect, it } from 'vitest';
import { traduireErreurAuth } from './erreursAuth';

describe('traduireErreurAuth', () => {
  it('traduit les messages Supabase courants', () => {
    expect(traduireErreurAuth({ message: 'Invalid login credentials' })).toBe('Adresse e-mail ou mot de passe incorrect.');
    expect(traduireErreurAuth({ message: 'User already registered' })).toBe('Un compte existe déjà avec cette adresse e-mail.');
    expect(traduireErreurAuth({ message: 'Email not confirmed' })).toMatch(/pas encore été confirmée/);
    expect(traduireErreurAuth('Password should be at least 6 characters')).toBe('Le mot de passe doit contenir au moins 6 caractères.');
    expect(traduireErreurAuth('For security purposes, you can only request this after 42 seconds.')).toBe('Par sécurité, patientez 42 secondes avant une nouvelle demande.');
    expect(traduireErreurAuth('Unsupported provider: provider is not enabled')).toMatch(/pas disponible/);
  });

  it("n'affiche jamais un message anglais inconnu", () => {
    const resultat = traduireErreurAuth({ message: 'Something unexpected happened on the server' });
    expect(resultat).toBe('Une erreur est survenue. Réessayez dans quelques instants.');
    expect(traduireErreurAuth(undefined)).toBe('Une erreur est survenue. Réessayez dans quelques instants.');
    expect(traduireErreurAuth({ message: '' })).toBe('Une erreur est survenue. Réessayez dans quelques instants.');
  });

  it('conserve un message déjà rédigé en français', () => {
    expect(traduireErreurAuth('Le mot de passe doit contenir au moins 6 caractères')).toBe('Le mot de passe doit contenir au moins 6 caractères');
  });
});

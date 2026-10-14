import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Le jeton du lien de réinitialisation (…/reset-password#token_hash=…) doit être lu puis retiré de
 * l'adresse AVANT l'initialisation de Sentry (qui enregistre l'URL des pages et des requêtes), et
 * avant Google Analytics. src/main.tsx est exécuté pour de vrai ; tout le reste est simulé.
 */
const etat = vi.hoisted(() => ({
  adresseALInitSentry: null as string | null,
  adresseALInitAnalytics: null as string | null,
  initSentry: vi.fn(),
  initGoogleAnalytics: vi.fn(),
}));

vi.mock('../App.tsx', () => ({ default: () => null }));
vi.mock('../index.css', () => ({}));
vi.mock('react-dom/client', () => ({ createRoot: () => ({ render: vi.fn() }) }));
vi.mock('../integrations/supabase/client', () => ({ supabase: { auth: {} } }));
vi.mock('../lib/partageGetUser', () => ({ installerPartageGetUser: vi.fn() }));
vi.mock('../lib/sentry', () => ({
  initSentry: () => {
    etat.adresseALInitSentry = window.location.href;
    etat.initSentry();
  },
}));
vi.mock('../lib/analytics', () => ({
  initGoogleAnalytics: () => {
    etat.adresseALInitAnalytics = window.location.href;
    etat.initGoogleAnalytics();
  },
}));

describe('src/main.tsx : jeton de récupération retiré de l’adresse avant Sentry', () => {
  beforeEach(() => {
    vi.resetModules();
    etat.adresseALInitSentry = null;
    etat.adresseALInitAnalytics = null;
    etat.initSentry.mockClear();
    etat.initGoogleAnalytics.mockClear();
    document.body.innerHTML = '<div id="root"></div>';
  });

  it('lit le jeton du fragment, le retire de l’adresse, puis seulement initialise Sentry et Analytics', async () => {
    window.history.replaceState(null, '', '/med-mng/reset-password#token_hash=jeton-secret-123&type=recovery');
    await import('../main.tsx');
    await vi.waitFor(() => expect(etat.initSentry).toHaveBeenCalledTimes(1));
    await vi.waitFor(() => expect(etat.initGoogleAnalytics).toHaveBeenCalledTimes(1));

    expect(etat.adresseALInitSentry).not.toContain('jeton-secret-123');
    expect(etat.adresseALInitSentry).toMatch(/\/med-mng\/reset-password$/);
    expect(etat.adresseALInitAnalytics).not.toContain('jeton-secret-123');

    // Le jeton n'est pas perdu : la page le prend en mémoire, une seule fois.
    const { prendreJetonRecuperation } = await import('../lib/jetonRecuperation');
    expect(prendreJetonRecuperation()).toEqual({ tokenHash: 'jeton-secret-123', type: 'recovery' });
    expect(prendreJetonRecuperation()).toBeNull();
  });

  it('ancien lien (?token_hash=… en query string) : même nettoyage avant Sentry', async () => {
    window.history.replaceState(null, '', '/med-mng/reset-password?token_hash=ancien-456&type=recovery');
    await import('../main.tsx');
    await vi.waitFor(() => expect(etat.initSentry).toHaveBeenCalledTimes(1));
    expect(etat.adresseALInitSentry).not.toContain('ancien-456');
  });
});

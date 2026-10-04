import { expect, test as setup } from '@playwright/test';
import fs from 'node:fs';
import { DOSSIER_SESSIONS, GRATUIT, PREMIUM, dispo, seConnecter, session } from './helpers';

/**
 * Connexion par le formulaire (comme une personne) des comptes de test fournis par variables
 * d'environnement. Les sessions sont écrites dans un dossier temporaire hors du dépôt et
 * supprimées à la fin (global-teardown). Aucun compte n'est créé.
 */
setup.beforeAll(() => fs.mkdirSync(DOSSIER_SESSIONS, { recursive: true, mode: 0o700 }));

for (const [nom, compte] of [['gratuit', GRATUIT], ['premium', PREMIUM]] as const) {
  setup(`connexion du compte ${nom}`, async ({ page }) => {
    setup.skip(!dispo(compte), `E2E_${nom === 'gratuit' ? 'FREE' : 'PREMIUM'}_EMAIL / _PASSWORD absents`);
    await seConnecter(page, compte);
    await expect(page).not.toHaveURL(/\/med-mng\/login/);
    await page.context().storageState({ path: session(nom) });
    fs.chmodSync(session(nom), 0o600);
  });
}

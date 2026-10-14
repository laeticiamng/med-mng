import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const stockage = vi.hoisted(() => ({ invoke: vi.fn() }));
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    storage: {
      from: () => ({
        getPublicUrl: () => ({
          data: { publicUrl: 'https://stockage.exemple/planche.png' },
        }),
      }),
    },
    functions: { invoke: stockage.invoke },
  },
}));

import { ImageAgrandissable } from '../ImageAgrandissable';
import { IllustrationCase } from '../IllustrationCase';
import { toucheReserveeAuControle } from '@/lib/touchesPage';

const SRC = 'https://stockage.exemple/planche.png';

const rendre = () => {
  const surAgrandissement = vi.fn();
  render(
    <ImageAgrandissable
      src={SRC}
      alt="Un médecin examine un patient"
      titre="Planche 2"
      surAgrandissement={surAgrandissement}
    />
  );
  return {
    surAgrandissement,
    bouton: screen.getByRole('button', {
      name: "Agrandir l'image : Planche 2",
    }),
  };
};

describe('Image de planche : affichage intégral', () => {
  it('l’image est entière (object-contain, hauteur proportionnelle) : ni hauteur fixe ni object-cover', () => {
    rendre();
    const img = screen.getByAltText('Un médecin examine un patient');
    expect(img.className).toContain('object-contain');
    expect(img.className).toContain('h-auto');
    expect(img.className).not.toContain('object-cover');
    expect(img.className).not.toMatch(/(^|\s)h-(48|96|\[60vh\])(\s|$)/);
  });
});

describe('Visionneuse d’image : accessible', () => {
  it('s’ouvre au clic sur le bouton, avec titre, zoom et fermeture', () => {
    const { bouton, surAgrandissement } = rendre();
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.click(bouton);
    expect(surAgrandissement).toHaveBeenCalledTimes(1);
    const dialogue = screen.getByRole('dialog', { name: 'Planche 2' });
    expect(
      within(dialogue).getByRole('img', {
        name: 'Un médecin examine un patient',
      })
    ).toHaveAttribute('src', SRC);
    expect(
      within(dialogue).getByRole('button', { name: 'Zoom avant' })
    ).toBeEnabled();
    expect(
      within(dialogue).getByRole('button', { name: 'Zoom arrière' })
    ).toBeDisabled();
    expect(
      within(dialogue).getByRole('button', { name: 'Fermer' })
    ).toBeInTheDocument();
    expect(
      within(dialogue).getByRole('region', { name: /Image agrandie/ })
    ).toHaveAttribute('tabindex', '0');
  });

  it('zoom avant, arrière et retour à l’écran entier (boutons et touches)', () => {
    const { bouton } = rendre();
    fireEvent.click(bouton);
    const dialogue = screen.getByRole('dialog');
    const img = within(dialogue).getByRole('img');
    fireEvent.click(
      within(dialogue).getByRole('button', { name: 'Zoom avant' })
    );
    expect(img).toHaveAttribute('data-zoom', '1.5');
    expect(img.style.width).toBe('150%');
    fireEvent.keyDown(dialogue, { key: '+' });
    expect(img).toHaveAttribute('data-zoom', '2');
    fireEvent.keyDown(dialogue, { key: '-' });
    expect(img).toHaveAttribute('data-zoom', '1.5');
    fireEvent.click(
      within(dialogue).getByRole('button', { name: "Ajuster à l'écran" })
    );
    expect(img).toHaveAttribute('data-zoom', '1');
    expect(img.className).toContain('object-contain');
  });

  it('Échap ferme la visionneuse et rend le focus au bouton d’agrandissement', async () => {
    const { bouton } = rendre();
    bouton.focus();
    fireEvent.click(bouton);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(bouton).toHaveFocus());
  });

  it('le bouton « Fermer » ferme la visionneuse', async () => {
    const { bouton } = rendre();
    fireEvent.click(bouton);
    fireEvent.click(screen.getByRole('button', { name: 'Fermer' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('Échap ne remonte pas à la page (qui, sinon, quitterait l’item)', () => {
    const surPage = vi.fn();
    window.addEventListener('keydown', surPage);
    const { bouton } = rendre();
    fireEvent.click(bouton);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    window.removeEventListener('keydown', surPage);
    expect(surPage).not.toHaveBeenCalled();
  });
});

describe('Diaporama des planches : touches', () => {
  afterEach(() => document.body.replaceChildren());
  const touche = (cible: Element, key: string) =>
    ({ target: cible, key }) as unknown as KeyboardEvent;
  it('la visionneuse garde ses flèches ; Espace/Entrée restent aux boutons', () => {
    document.body.innerHTML =
      '<div data-visionneuse><div id="z"></div></div><button id="b"></button><p id="p"></p>';
    expect(
      toucheReserveeAuControle(
        touche(document.getElementById('z')!, 'ArrowRight')
      )
    ).toBe(true);
    expect(
      toucheReserveeAuControle(touche(document.getElementById('b')!, ' '))
    ).toBe(true);
    expect(
      toucheReserveeAuControle(
        touche(document.getElementById('b')!, 'ArrowRight')
      )
    ).toBe(false);
    expect(
      toucheReserveeAuControle(touche(document.getElementById('p')!, ' '))
    ).toBe(false);
  });
});

describe('IllustrationCase : image existante affichée en entier et agrandissable', () => {
  it('image déjà dessinée : bouton d’agrandissement, object-contain, aucun appel de génération d’image', async () => {
    const reseau = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({ ok: true } as Response);
    render(
      <IllustrationCase
        itemCode="IC-14"
        illustration="Un médecin écoute un patient"
        titre="Planche 1"
        className="w-full rounded-t-lg"
      />
    );
    const bouton = await screen.findByRole('button', {
      name: "Agrandir l'image : Planche 1",
    });
    expect(within(bouton).getByRole('img').className).toContain(
      'object-contain'
    );
    expect(stockage.invoke).not.toHaveBeenCalled();
    reseau.mockRestore();
  });

  it('vignette : image entière aussi (object-contain), sans bouton', async () => {
    const reseau = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({ ok: true } as Response);
    render(
      <IllustrationCase
        itemCode="IC-14"
        illustration="Un médecin écoute un patient"
        titre="Planche 1"
        className="w-full h-full"
        miniature
      />
    );
    const img = await screen.findByRole('img');
    expect(img.className).toContain('object-contain');
    expect(img.className).not.toContain('object-cover');
    expect(screen.queryByRole('button')).toBeNull();
    reseau.mockRestore();
  });
});

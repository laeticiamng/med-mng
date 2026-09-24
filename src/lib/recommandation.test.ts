import { describe, expect, it } from 'vitest';
import {
  construireEtats,
  joursEcoules,
  libelleIlYa,
  raisonRevisionEchue,
  recommander,
  revisionsEchues,
  statutDe,
  type ProgressionSrs,
} from './recommandation';

const MAINTENANT = new Date(2026, 8, 24, 20, 0, 0); // 24 septembre 2026, 20 h
const ORDRE = Array.from({ length: 20 }, (_, i) => `IC-${i + 1}`);

const iso = (annee: number, mois: number, jour: number, heure = 10) =>
  new Date(annee, mois, jour, heure).toISOString();

const srs = (code: string, next: string, extra: Partial<ProgressionSrs> = {}): ProgressionSrs => ({
  item_code: code,
  next_review_date: next,
  last_review_date: iso(2026, 8, 1),
  interval_days: 3,
  created_at: iso(2026, 7, 20),
  ...extra,
});

describe('joursEcoules / libelleIlYa', () => {
  it('compte les jours calendaires', () => {
    expect(joursEcoules(new Date(2026, 8, 21, 23), MAINTENANT)).toBe(3);
    expect(joursEcoules(new Date(2026, 8, 24, 1), MAINTENANT)).toBe(0);
  });
  it('formule les durées', () => {
    expect(libelleIlYa(0)).toBe("aujourd'hui");
    expect(libelleIlYa(1)).toBe('hier');
    expect(libelleIlYa(5)).toBe('il y a 5 jours');
  });
});

describe('construireEtats', () => {
  it('classe à revoir, maîtrisé et en cours', () => {
    const etats = construireEtats(
      [
        srs('IC-1', iso(2026, 8, 20)),
        srs('IC-2', iso(2026, 9, 30), { interval_days: 30 }),
        srs('ic-3', iso(2026, 9, 1)),
      ],
      [{ item_code: 'IC-4', created_at: iso(2026, 8, 10) }],
      MAINTENANT,
    );
    expect(statutDe(etats, 'IC-1')).toBe('a_revoir');
    expect(statutDe(etats, 'IC-2')).toBe('maitrise');
    expect(statutDe(etats, 'IC-3')).toBe('en_cours');
    expect(statutDe(etats, 'IC-4')).toBe('en_cours');
    expect(statutDe(etats, 'IC-5')).toBe('non_commence');
  });

  it("fusionne l'historique des quiz dans les dates d'activité", () => {
    const etats = construireEtats(
      [srs('IC-7', iso(2026, 9, 1), { created_at: iso(2026, 8, 5), last_review_date: iso(2026, 8, 6) })],
      [
        { item_code: 'IC-7', created_at: iso(2026, 8, 2) },
        { item_code: 'IC-7', created_at: iso(2026, 8, 22) },
      ],
      MAINTENANT,
    );
    const e = etats.get('IC-7')!;
    expect(e.debut?.getDate()).toBe(2);
    expect(e.derniereActivite?.getDate()).toBe(22);
  });
});

describe('recommander', () => {
  it("renvoie l'item d'essai IC-1 sans aucune activité (non premium)", () => {
    const r = recommander({ etats: new Map(), codesOrdonnes: ORDRE, premium: false, maintenant: MAINTENANT });
    expect(r).toEqual({ code: 'IC-1', motif: 'item_essai', raison: "Item d'essai gratuit" });
  });

  it('priorité 1 : la révision échue la plus en retard', () => {
    const etats = construireEtats(
      [srs('IC-9', iso(2026, 8, 23)), srs('IC-4', iso(2026, 8, 21)), srs('IC-2', iso(2026, 9, 5))],
      [{ item_code: 'IC-12', created_at: iso(2026, 8, 24, 9) }],
      MAINTENANT,
    );
    const r = recommander({ etats, codesOrdonnes: ORDRE, premium: true, maintenant: MAINTENANT });
    expect(r?.code).toBe('IC-4');
    expect(r?.motif).toBe('revision_echue');
    expect(r?.raison).toBe('Révision prévue il y a 3 jours');
    expect(revisionsEchues(etats).map((e) => e.code)).toEqual(['IC-4', 'IC-9']);
  });

  it('priorité 2 : le dernier item commencé non maîtrisé', () => {
    const etats = construireEtats(
      [
        srs('IC-3', iso(2026, 9, 2), { last_review_date: iso(2026, 8, 10), created_at: iso(2026, 8, 10) }),
        srs('IC-5', iso(2026, 9, 3), { last_review_date: iso(2026, 8, 18), created_at: iso(2026, 8, 12) }),
        srs('IC-6', iso(2026, 10, 3), { last_review_date: iso(2026, 8, 23), interval_days: 40 }),
      ],
      [],
      MAINTENANT,
    );
    const r = recommander({ etats, codesOrdonnes: ORDRE, premium: false, maintenant: MAINTENANT });
    expect(r?.code).toBe('IC-5');
    expect(r?.motif).toBe('item_en_cours');
    expect(r?.raison).toBe("Vous l'avez commencé le 12 septembre");
  });

  it('priorité 3 : premier item gratuit non vu, puis ordre du programme', () => {
    const etatsMaitrises = construireEtats(
      ORDRE.slice(0, 10).map((c) => srs(c, iso(2026, 10, 30), { interval_days: 30 })),
      [],
      MAINTENANT,
    );
    // Items 1 à 10 maîtrisés : pas d'item d'essai restant.
    const r = recommander({ etats: etatsMaitrises, codesOrdonnes: ORDRE, premium: false, maintenant: MAINTENANT });
    expect(r?.code).toBe('IC-11');
    expect(r?.motif).toBe('prochain_item');

    // Un seul item d'essai vu : on propose le suivant parmi les gratuits.
    const etats = construireEtats([srs('IC-1', iso(2026, 10, 30), { interval_days: 30 })], [], MAINTENANT);
    expect(recommander({ etats, codesOrdonnes: ORDRE, premium: false, maintenant: MAINTENANT })?.code).toBe('IC-2');
  });

  it("premium : premier item non vu dans l'ordre, sans mention d'essai", () => {
    const etats = construireEtats([srs('IC-1', iso(2026, 10, 30), { interval_days: 30 })], [], MAINTENANT);
    const r = recommander({ etats, codesOrdonnes: ORDRE, premium: true, maintenant: MAINTENANT });
    expect(r).toEqual({ code: 'IC-2', motif: 'prochain_item', raison: 'Prochain item non commencé du programme' });
  });

  it('renvoie null quand tout est maîtrisé', () => {
    const etats = construireEtats(ORDRE.map((c) => srs(c, iso(2026, 10, 30), { interval_days: 30 })), [], MAINTENANT);
    expect(recommander({ etats, codesOrdonnes: ORDRE, premium: true, maintenant: MAINTENANT })).toBeNull();
  });
});

describe('raisonRevisionEchue', () => {
  it("formule aujourd'hui / hier", () => {
    expect(raisonRevisionEchue(new Date(2026, 8, 24, 8), MAINTENANT)).toBe("Révision prévue aujourd'hui");
    expect(raisonRevisionEchue(new Date(2026, 8, 23, 8), MAINTENANT)).toBe('Révision prévue hier');
  });
});

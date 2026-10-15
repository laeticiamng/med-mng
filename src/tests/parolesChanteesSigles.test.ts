import { describe, expect, it } from 'vitest';
import {
  epelerSigles,
  parolesChantees,
  sigleAEpeler,
} from '../../supabase/functions/_shared/mm-paroles-chantees';
import {
  calculerDureeSecondes,
  compterMotsChantes,
  construireRequeteSuno,
} from '../../supabase/functions/_shared/mm-suno-requete.ts';
import { parolesEnvoyees } from '@/config/stylesMusicaux';

/**
 * Épellation des sigles dans les paroles chantées (15.10.2026).
 *
 * Logique reprise de Memo MNG (`supabase/functions/_shared/phonetiqueChantee.ts`, bloc « épellation
 * des sigles » de `src/test/phonetiqueChantee.test.ts`) et complétée par des cas médicaux. Les
 * paroles AFFICHÉES gardent « HTA » ; seule la version envoyée au moteur est épelée.
 */

const epele = (s: string) => epelerSigles(s);

describe('sigles médicaux épelés dans la version chantée', () => {
  it.each([
    ["Le dépistage de l'HTA", "Le dépistage de l'H-T-A"],
    ['Après un AVC ischémique', 'Après un A-V-C ischémique'],
    ['Une IRM cérébrale en urgence', 'Une I-R-M cérébrale en urgence'],
    ['Exacerbation de BPCO', 'Exacerbation de B-P-C-O'],
    [
      'Un ECG de repos à douze dérivations',
      'Un E-C-G de repos à douze dérivations',
    ],
    ["L'OAP se traite en urgence", "L'O-A-P se traite en urgence"],
    [
      "Le diagnostic d'IDM repose sur la troponine",
      "Le diagnostic d'I-D-M repose sur la troponine",
    ],
    ['CRP, NFS et VS', 'C-R-P, N-F-S et V-S'],
    ['Traitement par IEC ou ARA', 'Traitement par I-E-C ou A-R-A'],
  ])('%s → %s', (source, attendu) => {
    expect(parolesChantees(source)).toBe(attendu);
  });

  it('HbA1c (casse mixte) est épelé, chiffre en toutes lettres', () => {
    expect(parolesChantees('Cible : HbA1c < 7 %')).toBe(
      'Cible : H-B-A-un-C < sept pour cent'
    );
    expect(parolesChantees('HbA1c à jeun')).toBe('H-B-A-un-C à jeun');
    expect(parolesChantees('hba1c et HBA1C')).toBe('H-B-A-un-C et H-B-A-un-C');
    // Un mot qui contient « HbA1c » n'est pas touché.
    expect(parolesChantees('préHbA1cique')).toBe('préHbA1cique');
  });

  it("l'accord avec les nombres, unités et ordinaux déjà traités est conservé", () => {
    expect(parolesChantees('HTA : PAS > 140 mmHg, 2e mesure')).toBe(
      'H-T-A : P-A-S > cent quarante millimètres de mercure, deuxième mesure'
    );
    expect(parolesChantees('AVC à 72 h')).toBe('A-V-C à soixante-douze heures');
  });
});

describe("codes d'item et codes à trait d'union : intacts", () => {
  it.each([
    'IC-66',
    'OIC-066-01-A',
    'IC-66 et OIC-066-01-B',
    'COVID-19 et H1N1',
    'le 5FU en perfusion',
    'CD4 bas, CD8 haut',
    'Item IC-348 : insuffisance cardiaque',
  ])('%s', (texte) => {
    expect(parolesChantees(texte)).toBe(texte);
  });

  it("un code d'item voisin d'un sigle ne protège pas le sigle", () => {
    expect(parolesChantees('IC-66 : HTA et AVC')).toBe(
      'IC-66 : H-T-A et A-V-C'
    );
  });
});

describe('sigles qui se lisent comme un mot : laissés intacts', () => {
  it.each([
    'Le SIDA et la SRAS',
    'Le SAMU arrive, puis le SMUR',
    'Un AINS est contre-indiqué',
    'Une GEU rompue',
    'Transfert au CHU',
    'Score APGAR à cinq minutes',
    'Transaminases ASAT et ALAT',
    'Un TAVI chez le sujet âgé',
    'Le syndrome HELLP',
    "Un patient d'EHPAD",
    "L'ONU, l'OTAN et l'UNICEF",
  ])('%s', (texte) => {
    expect(parolesChantees(texte)).toBe(texte);
  });

  it('les sigles lus comme un mot sont tracés comme laissés tels quels, pas comme épelés', () => {
    const r = epele("L'ADN, le SIDA et la CRP");
    expect(r.epeles).toEqual(expect.arrayContaining(['ADN', 'CRP']));
    expect(r.epeles).not.toContain('SIDA');
    expect(r.laisses).toContain('SIDA');
  });
});

describe("mots d'insistance et lignes criées : intacts", () => {
  it("n'épelle pas un mot crié", () => {
    expect(parolesChantees('STOP, plus JAMAIS ça')).toBe(
      'STOP, plus JAMAIS ça'
    );
    expect(parolesChantees('Danger : CHOC septique')).toBe(
      'Danger : CHOC septique'
    );
  });

  it.each([
    'PLUS FORT ENCORE MAINTENANT',
    'CRIE FORT AU VENT',
    'NON NON NON',
    'ATTENTION AU CHOC',
    'ECG ET NFS EN URGENCE',
  ])('laisse la ligne criée « %s » tranquille', (cri) => {
    expect(parolesChantees(cri)).toBe(cri);
  });

  it("une ligne de sigles n'est pas un cri : elle est épelée", () => {
    expect(parolesChantees('ECG, RP, NFS, CRP')).toBe(
      'E-C-G, R-P, N-F-S, C-R-P'
    );
    expect(parolesChantees('HTA AVC IDM')).toBe('H-T-A A-V-C I-D-M');
    expect(parolesChantees('HTA, HTA, HTA')).toBe('H-T-A, H-T-A, H-T-A');
    expect(parolesChantees('ECG ET NFS ET CRP')).toBe(
      'E-C-G ET N-F-S ET C-R-P'
    );
    expect(parolesChantees('NON! HTA! AVC!')).toBe('NON! H-T-A! A-V-C!');
  });

  it("deux mots capitalisés ne font pas un cri (« L'ADN et l'ARN »)", () => {
    expect(parolesChantees("L'ADN et l'ARN")).toBe("L'A-D-N et l'A-R-N");
  });
});

describe('balises de structure ([Refrain], [Couplet 1]) : intactes', () => {
  it('ligne de balise seule', () => {
    const texte = "[Couplet 1]\nL'HTA est silencieuse\n[Refrain]\nAVC, AVC";
    expect(parolesChantees(texte)).toBe(
      "[Couplet 1]\nL'H-T-A est silencieuse\n[Refrain]\nA-V-C, A-V-C"
    );
  });

  it('balise en capitales de 6 lettres au plus : jamais épelée, ni seule ni dans une ligne', () => {
    expect(parolesChantees('[CHORUS]')).toBe('[CHORUS]');
    expect(parolesChantees('[CHORUS] ECG')).toBe('[CHORUS] E-C-G');
    expect(parolesChantees('ECG [CHORUS] IRM')).toBe('E-C-G [CHORUS] I-R-M');
  });

  it('balise contenant un sigle', () => {
    expect(parolesChantees('[Refrain — HTA]')).toBe('[Refrain — HTA]');
  });
});

describe('chiffres romains et voie intraveineuse', () => {
  it("un chiffre romain (I, V, X) reste intact : il n'est pas un sigle", () => {
    expect(parolesChantees('Le motif IX revient')).toBe('Le motif IX revient');
    expect(parolesChantees('Stade IV, classe III, nerf XII')).toBe(
      'Stade IV, classe III, nerf XII'
    );
    expect(sigleAEpeler('XIV')).toBe(false);
  });

  it('« IV » est épelé après « voie » ou « en » (intraveineux), pas ailleurs', () => {
    expect(parolesChantees('Ceftriaxone par voie IV')).toBe(
      'Ceftriaxone par voie I-V'
    );
    expect(parolesChantees('Relais en IV puis per os')).toBe(
      'Relais en I-V puis per os'
    );
    expect(parolesChantees('Cancer au stade IV')).toBe('Cancer au stade IV');
    expect(parolesChantees('Classe NYHA IV')).toBe('Classe N-Y-H-A IV');
  });

  it('les sigles médicaux qui ressemblent à un chiffre romain sont épelés', () => {
    // CV (cardio-vasculaire), MM (myélome multiple), DM (diabète/dispositif médical), CI (contre-indication)
    expect(parolesChantees('Risque CV, MM, DM et CI')).toBe(
      'Risque C-V, M-M, D-M et C-I'
    );
  });

  it('les sigles médicaux qui sont aussi un mot courant sont épelés', () => {
    expect(parolesChantees('TV, SA et TA')).toBe('T-V, S-A et T-A');
    expect(parolesChantees('Anticorps anti-ENA, puis ENA')).toBe(
      'Anticorps anti-ENA, puis E-N-A'
    );
  });
});

describe('garde-fous (reprise des cas de Memo MNG)', () => {
  it.each([
    ["L'ADN et l'ARN", 'A-D-N', 'A-R-N'],
    ['Le SNC relaie', 'S-N-C', null],
    ['Mesurer la CRP', 'C-R-P', null],
    ['Un ECG normal', 'E-C-G', null],
  ] as Array<[string, string, string | null]>)(
    '%s → épelé',
    (source, attendu, autre) => {
      expect(parolesChantees(source)).toContain(attendu);
      if (autre) expect(parolesChantees(source)).toContain(autre);
    }
  );

  it("ne touche pas au sigle à l'intérieur d'un mot", () => {
    expect(parolesChantees('préADNique')).toBe('préADNique');
    expect(parolesChantees('ARNm et ADNc')).toBe('ARNm et ADNc');
    expect(parolesChantees('IgE totales')).toBe('IgE totales');
  });

  it("reste idempotent : un sigle déjà épelé ne l'est pas deux fois", () => {
    const une = parolesChantees("L'ADN porte le code");
    expect(parolesChantees(une)).toBe(une);
    const longue = [
      '[Couplet 1]',
      "L'HTA, l'AVC et l'IDM, 140/90 mmHg, HbA1c < 7 %",
      'IC-66 : par voie IV, CRP à 12 mg/L',
      '[Refrain]',
      'SAMU, AINS, STOP, JAMAIS',
    ].join('\n');
    const passe1 = parolesChantees(longue);
    expect(parolesChantees(passe1)).toBe(passe1);
  });

  it('trace ce qui a été épelé et ce qui a été épargné', () => {
    const r = epele("L'ADN, le SIDA et la CRP");
    expect(r.epeles).toEqual(expect.arrayContaining(['ADN', 'CRP']));
    expect(r.laisses).toContain('SIDA');
  });

  // Auto-contrôle : une épellation qui ne ferait rien passerait les tests « laisse intact » sans rien détecter.
  it('épelle réellement quelque chose', () => {
    const r = epele("Le rôle de l'ATP et du PIB");
    expect(r.epeles.length).toBeGreaterThanOrEqual(2);
    expect(r.texte).not.toBe("Le rôle de l'ATP et du PIB");
  });

  it('ne modifie rien dans un couplet sans sigle ni chiffre', () => {
    const couplet = [
      '[Verse 1]',
      'Le vent se lève et la nuit tombe',
      'Ma mémoire cherche un visage',
      'Dis-moi ce que Le monde cache',
      'Viens, Marche, Danse, Crie',
      "Comme un vieux mix de l'été",
      'Il y a dix chemins, dix visages',
      'Choisis, Va, Deviens ce que tu veux',
    ].join('\n');
    expect(parolesChantees(couplet)).toBe(couplet);
    const r = epele(couplet);
    expect(r.epeles).toHaveLength(0);
    expect(r.laisses).toHaveLength(0);
  });

  it("un texte vide ou sans lettre capitale est rendu à l'identique", () => {
    expect(parolesChantees('')).toBe('');
    expect(
      parolesChantees('la tension artérielle, la fréquence cardiaque')
    ).toBe('la tension artérielle, la fréquence cardiaque');
  });

  it('ne casse pas les fins de ligne', () => {
    expect(parolesChantees('HTA\n\nAVC\n')).toBe('H-T-A\n\nA-V-C\n');
  });
});

describe('effets sur la requête envoyée au moteur', () => {
  const paroles = [
    '[Couplet 1]',
    "L'HTA est silencieuse, l'AVC la suit",
    'IC-66 : on mesure la PAS à deux reprises',
    '[Refrain]',
    'AVC, IDM, OAP : trois urgences',
    'HbA1c sous sept pour cent',
  ];

  it('construireRequeteSuno envoie la version épelée (le champ `lyrics`)', () => {
    const { chargeUtile } = construireRequeteSuno({
      paroles,
      style: 'pop',
      rang: 'A',
      codeItem: 'IC-66',
      titreItem: 'Hypertension artérielle',
      modele: 'V6',
      callBackUrl: 'https://exemple.supabase.co/functions/v1/mm-suno-callback',
    });
    expect(chargeUtile.lyrics).toBe(
      [
        '[Couplet 1]',
        "L'H-T-A est silencieuse, l'A-V-C la suit",
        'IC-66 : on mesure la P-A-S à deux reprises',
        '[Refrain]',
        'A-V-C, I-D-M, O-A-P : trois urgences',
        'H-B-A-un-C sous sept pour cent',
      ].join('\n')
    );
    // Le titre porte le code d'item tel quel, jamais épelé.
    expect(chargeUtile.title).toContain('IC-66');
    expect(chargeUtile.title).not.toContain('I-C');
  });

  it('la prévision du site (parolesEnvoyees) est celle du serveur', () => {
    const cote = parolesEnvoyees(paroles);
    const { paroles: serveur } = construireRequeteSuno({
      paroles,
      style: 'pop',
      rang: 'A',
      modele: 'V6',
      callBackUrl: 'https://exemple.supabase.co/functions/v1/mm-suno-callback',
    });
    expect(cote.texte).toBe(serveur.texte);
    expect(cote.texte).toContain('A-V-C');
  });

  it('les lettres épelées comptent comme des mots chantés dans la durée estimée', () => {
    expect(compterMotsChantes('HTA')).toBe(1);
    expect(compterMotsChantes(parolesChantees('HTA'))).toBe(3);
    // Sur une chanson longue, la durée ne diminue jamais à cause de l'épellation.
    const longue = Array.from(
      { length: 40 },
      () => 'HTA AVC IDM OAP BPCO ECG IRM CRP NFS'
    ).join('\n');
    expect(
      calculerDureeSecondes(parolesChantees(longue))
    ).toBeGreaterThanOrEqual(calculerDureeSecondes(longue));
  });
});

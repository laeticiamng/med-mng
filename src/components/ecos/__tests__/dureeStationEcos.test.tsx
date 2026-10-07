import { act, fireEvent, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DUREE_STATION_ECOS_MINUTES } from '@/config/ecos';
import { EcosEvaluationGrid } from '../EcosEvaluationGrid';
import { EcosRealTimeTimer } from '../EcosRealTimeTimer';

// DC6 (06.10.2026) : arrêté du 13.11.2025 (JO du 19.11.2025, NOR SFHN2531901A) — station de
// 10 min dont 8 min d'épreuve « intégrant la lecture de la vignette ».
const source = (chemin: string) => readFileSync(resolve(process.cwd(), chemin), 'utf8');

describe('chronomètre ECOS : 8 minutes', () => {
  // `performance` n'est pas simulable dans cet environnement : on ne simule que les minuteries.
  beforeEach(() => { vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] }); });
  afterEach(() => vi.useRealTimers());

  it('la constante vaut 8', () => {
    expect(DUREE_STATION_ECOS_MINUTES).toBe(8);
  });

  it('démarre à 08:00 par défaut et affiche « 8 min »', () => {
    render(<EcosRealTimeTimer />);
    expect(screen.getByText('08:00')).toBeInTheDocument();
    expect(screen.getByText('8 min')).toBeInTheDocument();
  });

  it('ne s\'arrête qu\'après 8 minutes, pas à 7', () => {
    const onTimeUp = vi.fn();
    render(<EcosRealTimeTimer onTimeUp={onTimeUp} />);
    fireEvent.click(screen.getByRole('button', { name: /Démarrer/ }));

    act(() => { vi.advanceTimersByTime(7 * 60 * 1000); });
    expect(screen.getByText('01:00')).toBeInTheDocument();
    expect(onTimeUp).not.toHaveBeenCalled();

    act(() => { vi.advanceTimersByTime(60 * 1000); });
    expect(screen.getByText('00:00')).toBeInTheDocument();
    expect(screen.getByText('Temps écoulé')).toBeInTheDocument();
    expect(onTimeUp).toHaveBeenCalledTimes(1);
  });

  it('les pages utilisent la constante, sans « 7 min » restant', () => {
    expect(source('src/pages/EcosScenario.tsx')).toMatch(/durationMinutes=\{DUREE_STATION_ECOS_MINUTES\}/);
    expect(source('src/pages/EcosScenario.tsx')).toMatch(/duration: DUREE_STATION_ECOS_MINUTES/);
    expect(source('src/pages/EcosIndex.tsx')).toMatch(/\{DUREE_STATION_ECOS_MINUTES\} min par station/);
    for (const f of [
      'src/pages/EcosScenario.tsx', 'src/pages/EcosIndex.tsx', 'src/components/ecos/EcosRealTimeTimer.tsx',
      'src/components/ecos/EcosHeader.tsx',
      // EcosUNESSGrid.tsx supprimé le 07.10.2026 (nettoyage lot 1) : seul le barrel ecos/index.ts l'exportait.
    ]) {
      expect(source(f), f).not.toMatch(/\b7 min|durationMinutes[ =]*\{?7\b|duration: 7\b|dureeMinutes: 7\b/);
    }
  });
});

describe('grille d\'auto-évaluation ECOS (DC6)', () => {
  it('précise qu\'une station officielle évalue un seul domaine, avec une grille non publiée', () => {
    render(<EcosGridePourTest />);
    expect(screen.getByText(/Aux ECOS nationaux, chaque station évalue un seul domaine de compétence \(sur 11\), avec une grille propre à la station, non publiée\. Cochez seulement les critères qui s'appliquent à la situation\./)).toBeInTheDocument();
    expect(screen.getByText("Grille d'auto-évaluation ECOS (critères génériques)")).toBeInTheDocument();
  });

  it('critère int-2 : « début » et non « ATCD » (les antécédents ont int-3)', () => {
    render(<EcosGridePourTest />);
    expect(screen.getByText('Caractérise les symptômes (début, durée, intensité)')).toBeInTheDocument();
    expect(screen.queryByText(/Caractérise les symptômes \(ATCD/)).toBeNull();
    expect(screen.getByText('Recherche les antécédents pertinents')).toBeInTheDocument();
  });
});

function EcosGridePourTest() {
  return <EcosEvaluationGrid scenarioId="1" scenarioTitle="Douleur thoracique" />;
}

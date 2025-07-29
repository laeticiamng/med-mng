/**
 * 🧪 TESTS UNITAIRES - Parser de paroles synchronisées
 * Point 2.1 du ticket global : Couverture des parseurs critiques
 */

import { useSynchronizedLyrics } from '../../src/hooks/music/useSynchronizedLyrics';
import { renderHook } from '@testing-library/react';

// Mock des données de test
const mockTimestampedLyrics = [
  { timestamp: 0, text: 'Premier vers médical' },
  { timestamp: 2000, text: 'Deuxième vers thérapeutique' },
  { timestamp: 4000, text: 'Troisième vers de synthèse' }
];

const mockStringLyrics = `[00:00] Premier vers médical
[00:02] Deuxième vers thérapeutique
[00:04] Troisième vers de synthèse`;

const mockMalformedLyrics = `Premier vers sans timestamp
[00:02] Deuxième avec timestamp
Troisième sans timestamp`;

describe('🎵 useSynchronizedLyrics - Parser critique', () => {
  
  describe('🔍 Parsing de formats différents', () => {
    
    test('✅ Parse correctement un tableau de paroles timestampées', () => {
      const { result } = renderHook(() => useSynchronizedLyrics(mockTimestampedLyrics, 0));
      
      const lyrics = result.current.lyrics;
      expect(lyrics).toHaveLength(3);
      expect(lyrics[0]).toEqual({ timestamp: 0, text: 'Premier vers médical' });
      expect(lyrics[1]).toEqual({ timestamp: 2000, text: 'Deuxième vers thérapeutique' });
      expect(lyrics[2]).toEqual({ timestamp: 4000, text: 'Troisième vers de synthèse' });
    });

    test('✅ Parse correctement une chaîne avec timestamps [mm:ss]', () => {
      const { result } = renderHook(() => useSynchronizedLyrics(mockStringLyrics, 0));
      
      const lyrics = result.current.lyrics;
      expect(lyrics).toHaveLength(3);
      expect(lyrics[0]).toEqual({ timestamp: 0, text: 'Premier vers médical' });
      expect(lyrics[1]).toEqual({ timestamp: 2000, text: 'Deuxième vers thérapeutique' });
      expect(lyrics[2]).toEqual({ timestamp: 4000, text: 'Troisième vers de synthèse' });
    });

    test('✅ Gère gracieusement les paroles malformées', () => {
      const { result } = renderHook(() => useSynchronizedLyrics(mockMalformedLyrics, 0));
      
      const lyrics = result.current.lyrics;
      expect(lyrics).toHaveLength(3);
      expect(lyrics[0]).toEqual({ timestamp: 0, text: 'Premier vers sans timestamp' });
      expect(lyrics[1]).toEqual({ timestamp: 2000, text: 'Deuxième avec timestamp' });
      expect(lyrics[2]).toEqual({ timestamp: 0, text: 'Troisième sans timestamp' });
    });

    test('❌ Gère les données vides ou nulles', () => {
      const { result: resultNull } = renderHook(() => useSynchronizedLyrics(null, 0));
      const { result: resultEmpty } = renderHook(() => useSynchronizedLyrics('', 0));
      const { result: resultUndef } = renderHook(() => useSynchronizedLyrics(undefined, 0));
      
      expect(resultNull.current.lyrics).toEqual([]);
      expect(resultEmpty.current.lyrics).toEqual([]);
      expect(resultUndef.current.lyrics).toEqual([]);
    });
  });

  describe('🎯 Synchronisation temporelle', () => {
    
    test('✅ Calcule correctement la ligne active', () => {
      const { result, rerender } = renderHook(
        ({ currentTime }) => useSynchronizedLyrics(mockTimestampedLyrics, currentTime),
        { initialProps: { currentTime: 0 } }
      );
      
      // Au début
      expect(result.current.currentLineIndex).toBe(0);
      
      // À 1 seconde
      rerender({ currentTime: 1000 });
      expect(result.current.currentLineIndex).toBe(0);
      
      // À 2.5 secondes
      rerender({ currentTime: 2500 });
      expect(result.current.currentLineIndex).toBe(1);
      
      // À 5 secondes
      rerender({ currentTime: 5000 });
      expect(result.current.currentLineIndex).toBe(2);
    });

    test('✅ Retourne la ligne active correcte', () => {
      const { result, rerender } = renderHook(
        ({ currentTime }) => useSynchronizedLyrics(mockTimestampedLyrics, currentTime),
        { initialProps: { currentTime: 2500 } }
      );
      
      expect(result.current.currentLine).toEqual({
        timestamp: 2000,
        text: 'Deuxième vers thérapeutique'
      });
      
      // Change le temps
      rerender({ currentTime: 100 });
      expect(result.current.currentLine).toEqual({
        timestamp: 0,
        text: 'Premier vers médical'
      });
    });

    test('🔄 Gère les changements de données de paroles', () => {
      const { result, rerender } = renderHook(
        ({ lyricsData }) => useSynchronizedLyrics(lyricsData, 1000),
        { initialProps: { lyricsData: mockTimestampedLyrics } }
      );
      
      // Données initiales
      expect(result.current.lyrics).toHaveLength(3);
      
      // Changement des données
      const newLyrics = [{ timestamp: 0, text: 'Nouvelle parole unique' }];
      rerender({ lyricsData: newLyrics });
      
      expect(result.current.lyrics).toHaveLength(1);
      expect(result.current.currentLine?.text).toBe('Nouvelle parole unique');
    });
  });

  describe('🛡️ Cas d\'erreur et edge cases', () => {
    
    test('❌ Gère les timestamps négatifs', () => {
      const invalidLyrics = [
        { timestamp: -1000, text: 'Timestamp négatif' },
        { timestamp: 0, text: 'Timestamp zéro' },
        { timestamp: 1000, text: 'Timestamp positif' }
      ];
      
      const { result } = renderHook(() => useSynchronizedLyrics(invalidLyrics, 500));
      
      expect(result.current.lyrics).toHaveLength(3);
      expect(result.current.currentLineIndex).toBe(1); // Devrait pointer vers timestamp 0
    });

    test('🔤 Gère les caractères spéciaux dans les paroles', () => {
      const specialLyrics = `[00:00] Paroles avec émojis 🎵 et accents éàù
[00:02] Caractères spéciaux: @#$%^&*()
[00:04] Guillemets "doubles" et 'simples'`;
      
      const { result } = renderHook(() => useSynchronizedLyrics(specialLyrics, 0));
      
      expect(result.current.lyrics[0].text).toBe('Paroles avec émojis 🎵 et accents éàù');
      expect(result.current.lyrics[1].text).toBe('Caractères spéciaux: @#$%^&*()');
      expect(result.current.lyrics[2].text).toBe('Guillemets "doubles" et \'simples\'');
    });

    test('⏰ Gère les formats de timestamp variés', () => {
      const variedTimestamps = `[0:00] Format court
[01:30] Format long
[1:05] Format mixte
[00:00.500] Avec millisecondes`;
      
      const { result } = renderHook(() => useSynchronizedLyrics(variedTimestamps, 0));
      
      expect(result.current.lyrics).toHaveLength(4);
      expect(result.current.lyrics[0].timestamp).toBe(0);
      expect(result.current.lyrics[1].timestamp).toBe(90000); // 1:30 = 90s
      expect(result.current.lyrics[2].timestamp).toBe(65000); // 1:05 = 65s
    });

    test('📊 Performance avec beaucoup de paroles', () => {
      // Générer 1000 lignes de paroles
      const bigLyrics = Array(1000).fill(0).map((_, i) => ({
        timestamp: i * 1000,
        text: `Ligne ${i + 1} de paroles médicales`
      }));
      
      const start = performance.now();
      const { result } = renderHook(() => useSynchronizedLyrics(bigLyrics, 500000));
      const end = performance.now();
      
      expect(end - start).toBeLessThan(50); // Moins de 50ms
      expect(result.current.lyrics).toHaveLength(1000);
      expect(result.current.currentLineIndex).toBe(500); // À 500 secondes = ligne 500
    });
  });

  describe('🎼 Tests d\'intégration spécifiques MED-MNG', () => {
    
    test('🏥 Parse correctement les paroles médicales avec terminologie', () => {
      const medicalLyrics = `[00:00] Anamnèse et examen clinique
[00:03] Diagnostic différentiel à établir
[00:06] Thérapeutique et surveillance
[00:09] Pronostic et éducation patient`;
      
      const { result } = renderHook(() => useSynchronizedLyrics(medicalLyrics, 4500));
      
      expect(result.current.currentLine?.text).toBe('Thérapeutique et surveillance');
      expect(result.current.lyrics).toHaveLength(4);
      
      // Vérifier que tous les termes médicaux sont préservés
      const allTexts = result.current.lyrics.map(l => l.text).join(' ');
      expect(allTexts).toContain('Anamnèse');
      expect(allTexts).toContain('Diagnostic différentiel');
      expect(allTexts).toContain('Thérapeutique');
      expect(allTexts).toContain('Pronostic');
    });

    test('🎵 Gère les transitions entre items EDN', () => {
      const { result, rerender } = renderHook(
        ({ lyrics, time }) => useSynchronizedLyrics(lyrics, time),
        { 
          initialProps: { 
            lyrics: mockTimestampedLyrics, 
            time: 2000 
          } 
        }
      );
      
      // Item initial
      expect(result.current.currentLine?.text).toBe('Deuxième vers thérapeutique');
      
      // Changement d'item EDN (nouvelles paroles)
      const newItemLyrics = [
        { timestamp: 0, text: 'Nouveau concept médical' },
        { timestamp: 3000, text: 'Application clinique' }
      ];
      
      rerender({ lyrics: newItemLyrics, time: 0 });
      
      expect(result.current.currentLine?.text).toBe('Nouveau concept médical');
      expect(result.current.lyrics).toHaveLength(2);
    });
  });
});
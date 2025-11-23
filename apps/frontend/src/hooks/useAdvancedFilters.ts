/**
 * Hook pour gérer les filtres avancés de recherche EDN
 * Inclut sauvegarde locale des filtres favoris
 */

import logger from '@/lib/logger';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { EdnItemUnified } from '@shared/types/edn';
import { AdvancedFilters, DEFAULT_ADVANCED_FILTERS, SavedFilter } from '@shared/types/advancedFilters';

const SAVED_FILTERS_KEY = 'edn-saved-filters';

export const useAdvancedFilters = (items: EdnItemUnified[]) => {
  const [filters, setFilters] = useState<AdvancedFilters>(DEFAULT_ADVANCED_FILTERS);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [isActive, setIsActive] = useState(false);

  // Charger les filtres sauvegardés depuis localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVED_FILTERS_KEY);
      if (saved) {
        setSavedFilters(JSON.parse(saved));
      }
    } catch (error) {
      logger.error('Erreur lors du chargement des filtres sauvegardés:', error);
    }
  }, []);

  // Appliquer les filtres avancés
  const filteredItems = useMemo(() => {
    if (!isActive) return items;

    return items.filter(item => {
      // Filtre par spécialité
      if (filters.specialite && item.specialite !== filters.specialite) {
        return false;
      }

      // Filtre par domaine médical
      if (filters.domaineMedical && item.domaine_medical !== filters.domaineMedical) {
        return false;
      }

      // Filtre par difficulté
      if (filters.difficulty !== 'all') {
        const itemDifficulty = item.niveau_complexite?.toLowerCase();
        if (filters.difficulty === 'easy' && itemDifficulty !== 'facile') return false;
        if (filters.difficulty === 'medium' && itemDifficulty !== 'moyen') return false;
        if (filters.difficulty === 'hard' && itemDifficulty !== 'difficile') return false;
      }

      // Filtre par temps de lecture estimé (basé sur le contenu)
      const estimatedTime = estimateReadingTime(item);
      if (estimatedTime < filters.readingTimeMin || estimatedTime > filters.readingTimeMax) {
        return false;
      }

      // Filtre par statut de progression (simulé - à connecter avec le vrai état utilisateur)
      if (filters.progressStatus !== 'all') {
        // TODO: Intégrer avec le système de progression réel
        // Pour l'instant, on se base sur le score de complétude
        const score = item.completeness_score || 0;
        if (filters.progressStatus === 'not-started' && score > 0) return false;
        if (filters.progressStatus === 'in-progress' && (score === 0 || score === 100)) return false;
        if (filters.progressStatus === 'completed' && score < 100) return false;
      }

      // Filtres de contenu disponible
      if (filters.hasMusic && !item.has_paroles_musicales) return false;
      if (filters.hasQuiz && !item.has_quiz_questions) return false;
      if (filters.hasBD && !item.has_scene_immersive) return false;
      if (filters.hasTableauA && !item.has_tableau_rang_a) return false;
      if (filters.hasTableauB && !item.has_tableau_rang_b) return false;

      // Filtre par validation
      if (filters.isValidated !== null && item.is_validated !== filters.isValidated) {
        return false;
      }

      // Filtre par score de complétude minimum
      const score = item.completeness_score || 0;
      if (score < filters.minCompletenessScore) {
        return false;
      }

      return true;
    });
  }, [items, filters, isActive]);

  // Estimer le temps de lecture basé sur le contenu
  const estimateReadingTime = (item: EdnItemUnified): number => {
    // Estimation basée sur 200 mots/minute
    let wordCount = 0;
    
    if (item.title) wordCount += item.title.split(' ').length;
    if (item.subtitle) wordCount += item.subtitle.split(' ').length;
    
    // Estimer à partir des compteurs
    wordCount += (item.competences_count_rang_a || 0) * 20; // ~20 mots par compétence
    wordCount += (item.competences_count_rang_b || 0) * 20;
    
    const minutes = Math.max(5, Math.ceil(wordCount / 200));
    return Math.min(60, minutes); // Cap à 60 minutes
  };

  // Obtenir les spécialités uniques
  const availableSpecialites = useMemo(() => {
    const specialites = new Set<string>();
    items.forEach(item => {
      if (item.specialite) specialites.add(item.specialite);
    });
    return Array.from(specialites).sort();
  }, [items]);

  // Obtenir les domaines médicaux uniques
  const availableDomaines = useMemo(() => {
    const domaines = new Set<string>();
    items.forEach(item => {
      if (item.domaine_medical) domaines.add(item.domaine_medical);
    });
    return Array.from(domaines).sort();
  }, [items]);

  // Mettre à jour les filtres
  const updateFilters = useCallback((newFilters: Partial<AdvancedFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setIsActive(true);
  }, []);

  // Réinitialiser les filtres
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_ADVANCED_FILTERS);
    setIsActive(false);
  }, []);

  // Sauvegarder un filtre
  const saveFilter = useCallback((name: string, isFavorite = false) => {
    const newFilter: SavedFilter = {
      id: `filter-${Date.now()}`,
      name,
      filters: { ...filters },
      createdAt: new Date().toISOString(),
      isFavorite,
    };

    const updated = [...savedFilters, newFilter];
    setSavedFilters(updated);
    localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(updated));
  }, [filters, savedFilters]);

  // Charger un filtre sauvegardé
  const loadFilter = useCallback((filterId: string) => {
    const filter = savedFilters.find(f => f.id === filterId);
    if (filter) {
      setFilters(filter.filters);
      setIsActive(true);
    }
  }, [savedFilters]);

  // Supprimer un filtre sauvegardé
  const deleteFilter = useCallback((filterId: string) => {
    const updated = savedFilters.filter(f => f.id !== filterId);
    setSavedFilters(updated);
    localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(updated));
  }, [savedFilters]);

  // Toggle favori
  const toggleFavorite = useCallback((filterId: string) => {
    const updated = savedFilters.map(f => 
      f.id === filterId ? { ...f, isFavorite: !f.isFavorite } : f
    );
    setSavedFilters(updated);
    localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(updated));
  }, [savedFilters]);

  // Vérifier si des filtres sont actifs
  const hasActiveFilters = useMemo(() => {
    if (!isActive) return false;
    
    return (
      filters.difficulty !== 'all' ||
      filters.progressStatus !== 'all' ||
      filters.hasMusic ||
      filters.hasQuiz ||
      filters.hasBD ||
      filters.hasTableauA ||
      filters.hasTableauB ||
      filters.isValidated !== null ||
      filters.minCompletenessScore > 0 ||
      filters.specialite !== undefined ||
      filters.domaineMedical !== undefined ||
      filters.readingTimeMin !== DEFAULT_ADVANCED_FILTERS.readingTimeMin ||
      filters.readingTimeMax !== DEFAULT_ADVANCED_FILTERS.readingTimeMax
    );
  }, [filters, isActive]);

  return {
    filters,
    filteredItems,
    isActive,
    hasActiveFilters,
    updateFilters,
    resetFilters,
    savedFilters: savedFilters.sort((a, b) => b.isFavorite ? 1 : -1),
    saveFilter,
    loadFilter,
    deleteFilter,
    toggleFavorite,
    availableSpecialites,
    availableDomaines,
  };
};

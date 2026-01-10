/**
 * Hook pour gérer les paramètres avancés Suno V4.5+
 * Expose vocalGender, negativeTags, styleWeight, etc.
 */

import { useState, useCallback } from 'react';

export type VocalGender = 'male' | 'female' | 'mixed';

export interface AdvancedSunoParams {
  vocalGender?: VocalGender;
  negativeTags?: string;
  styleWeight?: number; // 0-100
  weirdnessConstraint?: number; // 0-100
  audioWeight?: number; // 0-100
  personaId?: string;
}

const DEFAULT_PARAMS: AdvancedSunoParams = {
  vocalGender: undefined,
  negativeTags: '',
  styleWeight: 50,
  weirdnessConstraint: 30,
  audioWeight: 50,
  personaId: undefined
};

export const useAdvancedSunoParams = () => {
  const [params, setParams] = useState<AdvancedSunoParams>(DEFAULT_PARAMS);
  const [isEnabled, setIsEnabled] = useState(false);

  const updateParam = useCallback(<K extends keyof AdvancedSunoParams>(
    key: K, 
    value: AdvancedSunoParams[K]
  ) => {
    setParams(prev => ({ ...prev, [key]: value }));
  }, []);

  const setVocalGender = useCallback((gender: VocalGender | undefined) => {
    updateParam('vocalGender', gender);
  }, [updateParam]);

  const setNegativeTags = useCallback((tags: string) => {
    updateParam('negativeTags', tags);
  }, [updateParam]);

  const setStyleWeight = useCallback((weight: number) => {
    updateParam('styleWeight', Math.min(100, Math.max(0, weight)));
  }, [updateParam]);

  const setWeirdnessConstraint = useCallback((constraint: number) => {
    updateParam('weirdnessConstraint', Math.min(100, Math.max(0, constraint)));
  }, [updateParam]);

  const setAudioWeight = useCallback((weight: number) => {
    updateParam('audioWeight', Math.min(100, Math.max(0, weight)));
  }, [updateParam]);

  const reset = useCallback(() => {
    setParams(DEFAULT_PARAMS);
    setIsEnabled(false);
  }, []);

  const toggleEnabled = useCallback(() => {
    setIsEnabled(prev => !prev);
  }, []);

  // Retourne les params seulement si activés
  const getActiveParams = useCallback((): Partial<AdvancedSunoParams> | undefined => {
    if (!isEnabled) return undefined;
    
    const active: Partial<AdvancedSunoParams> = {};
    
    if (params.vocalGender) active.vocalGender = params.vocalGender;
    if (params.negativeTags?.trim()) active.negativeTags = params.negativeTags.trim();
    if (params.styleWeight !== 50) active.styleWeight = params.styleWeight;
    if (params.weirdnessConstraint !== 30) active.weirdnessConstraint = params.weirdnessConstraint;
    if (params.audioWeight !== 50) active.audioWeight = params.audioWeight;
    if (params.personaId) active.personaId = params.personaId;
    
    return Object.keys(active).length > 0 ? active : undefined;
  }, [isEnabled, params]);

  return {
    params,
    isEnabled,
    toggleEnabled,
    setVocalGender,
    setNegativeTags,
    setStyleWeight,
    setWeirdnessConstraint,
    setAudioWeight,
    updateParam,
    reset,
    getActiveParams
  };
};

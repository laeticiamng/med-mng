/**
 * Paramètres avancés du générateur audio, tous réellement transmis à
 * mm-generate-music (aucun réglage factice) :
 *  - vocalGender : 'm' | 'f' (Suno n'accepte que ces deux valeurs ; absent = choix libre) ;
 *  - negativeTags : sons à éviter, ajoutés aux exclusions du style ;
 *  - styleWeight / weirdnessConstraint : curseurs 0–100 %, envoyés en 0–1 seulement
 *    s'ils diffèrent des défauts du serveur (70 % / 30 %).
 */

import { useState, useCallback } from 'react';

export type VocalGender = 'm' | 'f';

export interface AdvancedSunoParams {
  vocalGender?: VocalGender;
  negativeTags?: string;
  /** 0–100 (%) */
  styleWeight?: number;
  /** 0–100 (%) */
  weirdnessConstraint?: number;
}

/** Défauts alignés sur le serveur (POIDS_PAR_DEFAUT dans mm-suno-requete.ts : 0,7 / 0,3). */
export const STYLE_WEIGHT_DEFAUT = 70;
export const WEIRDNESS_DEFAUT = 30;

const DEFAULT_PARAMS: AdvancedSunoParams = {
  vocalGender: undefined,
  negativeTags: '',
  styleWeight: STYLE_WEIGHT_DEFAUT,
  weirdnessConstraint: WEIRDNESS_DEFAUT,
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

  const reset = useCallback(() => {
    setParams(DEFAULT_PARAMS);
    setIsEnabled(false);
  }, []);

  const toggleEnabled = useCallback(() => {
    setIsEnabled(prev => !prev);
  }, []);

  /** Paramètres réellement modifiés (panneau ouvert), ou undefined : le serveur applique ses défauts. */
  const getActiveParams = useCallback((): Partial<AdvancedSunoParams> | undefined => {
    if (!isEnabled) return undefined;

    const active: Partial<AdvancedSunoParams> = {};

    if (params.vocalGender === 'm' || params.vocalGender === 'f') active.vocalGender = params.vocalGender;
    if (params.negativeTags?.trim()) active.negativeTags = params.negativeTags.trim();
    if (params.styleWeight !== undefined && params.styleWeight !== STYLE_WEIGHT_DEFAUT) active.styleWeight = params.styleWeight;
    if (params.weirdnessConstraint !== undefined && params.weirdnessConstraint !== WEIRDNESS_DEFAUT) active.weirdnessConstraint = params.weirdnessConstraint;

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
    updateParam,
    reset,
    getActiveParams
  };
};

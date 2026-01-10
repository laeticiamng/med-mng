/**
 * Wrapper simplifié pour AdvancedSunoParamsPanel
 * ✅ Intègre useAdvancedSunoParams + AdvancedSunoParamsPanel
 */

import React from 'react';
import { AdvancedSunoParamsPanel } from './AdvancedSunoParamsPanel';
import { useAdvancedSunoParams, type AdvancedSunoParams } from '@/hooks/music/useAdvancedSunoParams';

interface AdvancedParamsToggleProps {
  disabled?: boolean;
  onParamsChange?: (params: Partial<AdvancedSunoParams> | undefined) => void;
}

export const AdvancedParamsToggle: React.FC<AdvancedParamsToggleProps> = ({
  disabled = false,
  onParamsChange
}) => {
  const {
    params,
    isEnabled,
    toggleEnabled,
    setVocalGender,
    setNegativeTags,
    setStyleWeight,
    setWeirdnessConstraint,
    reset,
    getActiveParams
  } = useAdvancedSunoParams();

  // Notifier le parent quand les params changent
  React.useEffect(() => {
    if (onParamsChange) {
      onParamsChange(getActiveParams());
    }
  }, [params, isEnabled, getActiveParams, onParamsChange]);

  if (disabled) {
    return null;
  }

  return (
    <AdvancedSunoParamsPanel
      params={params}
      isEnabled={isEnabled}
      onToggleEnabled={toggleEnabled}
      onSetVocalGender={setVocalGender}
      onSetNegativeTags={setNegativeTags}
      onSetStyleWeight={setStyleWeight}
      onSetWeirdnessConstraint={setWeirdnessConstraint}
      onReset={reset}
    />
  );
};

// Export du hook pour usage externe
export { useAdvancedSunoParams, type AdvancedSunoParams };

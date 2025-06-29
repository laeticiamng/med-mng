
import React from 'react';
import { ParolesMusicalesControls } from './ParolesMusicalesControls';

interface MedMngParolesMusicalesControlsProps {
  selectedStyle: string;
  musicDuration: number;
  onStyleChange: (style: string) => void;
  onDurationChange: (duration: number) => void;
}

export const MedMngParolesMusicalesControls: React.FC<MedMngParolesMusicalesControlsProps> = ({
  selectedStyle,
  musicDuration,
  onStyleChange,
  onDurationChange
}) => {
  return (
    <ParolesMusicalesControls
      selectedStyle={selectedStyle}
      musicDuration={musicDuration}
      onStyleChange={onStyleChange}
      onDurationChange={onDurationChange}
    />
  );
};

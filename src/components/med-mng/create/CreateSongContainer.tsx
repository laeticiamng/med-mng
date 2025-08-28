
import React from 'react';
import { CreateSongForm } from './CreateSongForm';
import { CreateSongPreview } from './CreateSongPreview';

interface CreateSongContainerProps {
  selectedItem: string;
  selectedRang: string;
  style: string;
  isGenerating: boolean;
  generatedSong: any;
  selectedTitle: string;
  canGenerate: boolean;
  onItemChange: (value: string) => void;
  onRangChange: (value: string) => void;
  onStyleChange: (value: string) => void;
  onGenerate: () => void;
  onPlay: () => void;
  onAddToLibrary: () => void;
}

export const CreateSongContainer: React.FC<CreateSongContainerProps> = ({
  selectedItem,
  selectedRang,
  style,
  isGenerating,
  generatedSong,
  selectedTitle,
  canGenerate,
  onItemChange,
  onRangChange,
  onStyleChange,
  onGenerate,
  onPlay,
  onAddToLibrary
}) => {
  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <CreateSongForm
        selectedItem={selectedItem}
        selectedRang={selectedRang}
        style={style}
        isGenerating={isGenerating}
        selectedTitle={selectedTitle}
        canGenerate={canGenerate}
        onItemChange={onItemChange}
        onRangChange={onRangChange}
        onStyleChange={onStyleChange}
        onGenerate={onGenerate}
      />

      <CreateSongPreview
        generatedSong={generatedSong}
        style={style}
        selectedTitle={selectedTitle}
        onPlay={onPlay}
        onAddToLibrary={onAddToLibrary}
      />
    </div>
  );
};

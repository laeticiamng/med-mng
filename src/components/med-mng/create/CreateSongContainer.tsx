
import React from 'react';
import { CreateSongForm } from './CreateSongForm';
import { CreateSongPreview } from './CreateSongPreview';

interface CreateSongContainerProps {
  contentType: string;
  selectedItem: string;
  selectedRang: string;
  selectedSituation: string;
  style: string;
  isGenerating: boolean;
  generatedSong: any;
  selectedTitle: string;
  canGenerate: boolean;
  onContentTypeChange: (value: string) => void;
  onItemChange: (value: string) => void;
  onRangChange: (value: string) => void;
  onSituationChange: (value: string) => void;
  onStyleChange: (value: string) => void;
  onGenerate: () => void;
  onPlay: () => void;
  onAddToLibrary: () => void;
}

export const CreateSongContainer: React.FC<CreateSongContainerProps> = ({
  contentType,
  selectedItem,
  selectedRang,
  selectedSituation,
  style,
  isGenerating,
  generatedSong,
  selectedTitle,
  canGenerate,
  onContentTypeChange,
  onItemChange,
  onRangChange,
  onSituationChange,
  onStyleChange,
  onGenerate,
  onPlay,
  onAddToLibrary
}) => {
  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <CreateSongForm
        contentType={contentType}
        selectedItem={selectedItem}
        selectedRang={selectedRang}
        selectedSituation={selectedSituation}
        style={style}
        isGenerating={isGenerating}
        selectedTitle={selectedTitle}
        canGenerate={canGenerate}
        onContentTypeChange={onContentTypeChange}
        onItemChange={onItemChange}
        onRangChange={onRangChange}
        onSituationChange={onSituationChange}
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

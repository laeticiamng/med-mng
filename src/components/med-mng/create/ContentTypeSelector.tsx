
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ContentTypeSelectorProps {
  contentType: string;
  onContentTypeChange: (value: string) => void;
  disabled?: boolean;
}

export const ContentTypeSelector: React.FC<ContentTypeSelectorProps> = ({
  contentType,
  onContentTypeChange,
  disabled = false
}) => {
  return (
    <div>
      <Label htmlFor="contentType">Type de contenu</Label>
      <Select value={contentType} onValueChange={onContentTypeChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder="Choisissez le type de contenu" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="item">Item EDN</SelectItem>
          <SelectItem value="situation">Situation de départ</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

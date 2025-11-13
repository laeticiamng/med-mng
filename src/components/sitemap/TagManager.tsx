import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Tag as TagIcon } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface TagData {
  id: string;
  name: string;
  color: string;
  routes: string[];
}

interface TagManagerProps {
  tags: TagData[];
  onTagsChange: (tags: TagData[]) => void;
  onRouteTagged: (routePath: string, tagId: string) => void;
  onRouteUntagged: (routePath: string, tagId: string) => void;
}

function SortableTag({ tag, onDelete }: { tag: TagData; onDelete: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tag.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors cursor-move"
      {...attributes}
      {...listeners}
    >
      <TagIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <Badge
        className="flex-1"
        style={{
          backgroundColor: tag.color,
          color: '#fff',
        }}
      >
        {tag.name}
      </Badge>
      <span className="text-sm text-muted-foreground">
        {tag.routes.length} pages
      </span>
      <Button
        size="icon"
        variant="ghost"
        className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}

export function TagManager({ tags, onTagsChange, onRouteTagged, onRouteUntagged }: TagManagerProps) {
  const [newTagName, setNewTagName] = useState('');
  const [showAddTag, setShowAddTag] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const predefinedColors = [
    'hsl(var(--primary))',
    'hsl(var(--accent))',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
  ];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tags.findIndex((tag) => tag.id === active.id);
      const newIndex = tags.findIndex((tag) => tag.id === over.id);

      onTagsChange(arrayMove(tags, oldIndex, newIndex));
    }
  };

  const handleAddTag = () => {
    if (!newTagName.trim()) return;

    const newTag: TagData = {
      id: `tag-${Date.now()}`,
      name: newTagName.trim(),
      color: predefinedColors[tags.length % predefinedColors.length],
      routes: [],
    };

    onTagsChange([...tags, newTag]);
    setNewTagName('');
    setShowAddTag(false);
  };

  const handleDeleteTag = (tagId: string) => {
    onTagsChange(tags.filter((tag) => tag.id !== tagId));
  };

  return (
    <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <TagIcon className="h-6 w-6 text-accent" />
            </div>
            <div>
              <CardTitle className="text-xl">Tags personnalisés</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Organisez vos favoris par thème ou projet
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setShowAddTag(!showAddTag)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Nouveau tag
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddTag && (
          <div className="flex gap-2 p-4 bg-muted/50 rounded-lg border border-border">
            <Input
              placeholder="Nom du tag..."
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTag();
                if (e.key === 'Escape') setShowAddTag(false);
              }}
              autoFocus
            />
            <Button onClick={handleAddTag}>Ajouter</Button>
            <Button variant="outline" onClick={() => setShowAddTag(false)}>
              Annuler
            </Button>
          </div>
        )}

        {tags.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <TagIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Aucun tag créé</p>
            <p className="text-sm">Créez des tags pour organiser vos favoris</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={tags.map((tag) => tag.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {tags.map((tag) => (
                  <SortableTag
                    key={tag.id}
                    tag={tag}
                    onDelete={() => handleDeleteTag(tag.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {tags.length > 0 && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            💡 Glissez-déposez pour réorganiser vos tags
          </p>
        )}
      </CardContent>
    </Card>
  );
}

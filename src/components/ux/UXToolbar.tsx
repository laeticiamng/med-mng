import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Undo2, 
  Redo2, 
  Keyboard, 
  Accessibility,
  Eye,
  Volume2
} from 'lucide-react';

export const UXToolbar: React.FC = () => {
  console.log('🔧 UXToolbar is rendering!');

  return (
    <div
      className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-2 shadow-lg"
      role="toolbar"
      aria-label="Outils d'accessibilité et de navigation"
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      }}
    >
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => console.log('Undo clicked!')}
          style={{ background: '#f3f4f6', color: '#374151' }}
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => console.log('Redo clicked!')}
          style={{ background: '#f3f4f6', color: '#374151' }}
        >
          <Redo2 className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => console.log('Keyboard clicked!')}
          style={{ background: '#f3f4f6', color: '#374151' }}
        >
          <Keyboard className="h-4 w-4" />
        </Button>
      </div>
      
      <div style={{ 
        marginTop: '8px', 
        fontSize: '12px', 
        color: '#6b7280' 
      }}>
        🔧 Toolbar test
      </div>
    </div>
  );
};
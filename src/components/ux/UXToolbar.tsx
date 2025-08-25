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
  console.log('🔧 UXToolbar rendering with Tailwind styles');
  
  return (
    <div
      className="fixed bottom-4 right-4 z-50 bg-white border border-gray-300 rounded-lg p-2 shadow-lg"
      role="toolbar"
      aria-label="Outils d'accessibilité et de navigation"
      style={{ 
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        minWidth: '200px',
        minHeight: '50px'
      }}
    >
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="bg-gray-100 text-gray-700 hover:bg-gray-200"
          onClick={() => console.log('🔧 Undo clicked!')}
          style={{ backgroundColor: '#f3f4f6', color: '#374151' }}
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="bg-gray-100 text-gray-700 hover:bg-gray-200"
          onClick={() => console.log('🔧 Redo clicked!')}
          style={{ backgroundColor: '#f3f4f6', color: '#374151' }}
        >
          <Redo2 className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm" 
          className="bg-gray-100 text-gray-700 hover:bg-gray-200"
          onClick={() => console.log('🔧 Keyboard clicked!')}
          style={{ backgroundColor: '#f3f4f6', color: '#374151' }}
        >
          <Keyboard className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="text-xs text-gray-500 mt-2">
        🔧 Debug mode
      </div>
    </div>
  );
};
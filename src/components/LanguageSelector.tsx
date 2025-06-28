
import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage, SUPPORTED_LANGUAGES, SupportedLanguage } from '@/contexts/LanguageContext';

export const LanguageSelector: React.FC = () => {
  const { currentLanguage, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="bg-white/95 backdrop-blur-sm border-gray-300 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
          >
            <Globe className="h-4 w-4 mr-2" />
            <span className="text-lg mr-1">{SUPPORTED_LANGUAGES[currentLanguage].flag}</span>
            <span className="hidden sm:inline text-sm font-medium">{SUPPORTED_LANGUAGES[currentLanguage].name}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[200px] max-h-[400px] overflow-y-auto bg-white/95 backdrop-blur-sm">
          {Object.entries(SUPPORTED_LANGUAGES).map(([code, { name, flag }]) => (
            <DropdownMenuItem
              key={code}
              onClick={() => handleLanguageChange(code as SupportedLanguage)}
              className={`flex items-center gap-3 cursor-pointer hover:bg-blue-50 transition-colors ${
                currentLanguage === code ? 'bg-blue-100 text-blue-700 font-medium' : ''
              }`}
            >
              <span className="text-lg">{flag}</span>
              <span className="font-medium">{name}</span>
              {currentLanguage === code && (
                <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};


import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage, Language, LANGUAGES } from '@/contexts/LanguageContext';

export const LanguageSelector: React.FC = () => {
  const { currentLanguage, setCurrentLanguage, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (lang: Language) => {
    setCurrentLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="bg-white/95 backdrop-blur-sm border-gray-300 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
          >
            <Globe className="h-4 w-4 mr-2" />
            <span className="text-lg mr-1">{languages.find(l => l.code === currentLanguage)?.flag}</span>
            <span className="hidden sm:inline text-sm font-medium">{languages.find(l => l.code === currentLanguage)?.nativeName}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[200px] max-h-[400px] overflow-y-auto bg-white/95 backdrop-blur-sm">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`flex items-center gap-3 cursor-pointer hover:bg-blue-50 transition-colors ${
                currentLanguage === lang.code ? 'bg-blue-100 text-blue-700 font-medium' : ''
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="font-medium">{lang.nativeName}</span>
              {currentLanguage === lang.code && (
                <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

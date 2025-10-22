import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, Info } from "lucide-react";

interface TooltipInfoProps {
  content: string | React.ReactNode;
  icon?: 'help' | 'info';
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export const TooltipInfo: React.FC<TooltipInfoProps> = ({
  content,
  icon = 'help',
  side = 'top',
  className = ''
}) => {
  const IconComponent = icon === 'help' ? HelpCircle : Info;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`inline-flex items-center justify-center w-5 h-5 text-muted-foreground hover:text-foreground transition-colors ${className}`}
            onClick={(e) => e.preventDefault()}
          >
            <IconComponent className="w-4 h-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <div className="text-sm">{content}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

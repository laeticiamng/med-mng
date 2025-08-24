import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  badge?: string;
  disabled?: boolean;
}

interface InteractiveTabsProps {
  tabs: TabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const InteractiveTabs: React.FC<InteractiveTabsProps> = ({
  tabs,
  defaultValue,
  value,
  onValueChange,
  variant = 'default',
  size = 'md',
  className
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'pills':
        return 'bg-black/40 backdrop-blur-sm border border-white/20 shadow-2xl rounded-2xl p-1';
      case 'underline':
        return 'bg-transparent border-b border-white/20';
      case 'default':
      default:
        return 'bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-9 px-3 text-sm';
      case 'lg':
        return 'h-12 px-6 text-lg';
      case 'md':
      default:
        return 'h-10 px-4 text-base';
    }
  };

  const getTriggerClasses = (isActive: boolean) => {
    const baseClasses = `font-medium rounded-xl transition-all duration-200 ${getSizeClasses()}`;
    
    if (variant === 'underline') {
      return cn(
        baseClasses,
        'rounded-none border-b-2 bg-transparent',
        isActive 
          ? 'text-white border-b-purple-400' 
          : 'text-gray-300 border-b-transparent hover:text-white hover:border-b-white/30'
      );
    }
    
    return cn(
      baseClasses,
      isActive
        ? 'text-white bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg'
        : 'text-gray-300 hover:text-white hover:bg-white/10'
    );
  };

  return (
    <Tabs 
      value={value} 
      defaultValue={defaultValue} 
      onValueChange={onValueChange}
      className={className}
    >
      <TabsList className={getVariantClasses()}>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            disabled={tab.disabled}
            className={getTriggerClasses(value === tab.id)}
          >
            <div className="flex items-center gap-2">
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
                  {tab.badge}
                </span>
              )}
            </div>
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent 
          key={tab.id} 
          value={tab.id}
          className="mt-6 focus:outline-none animate-fade-in"
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};
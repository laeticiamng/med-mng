
import React from 'react';
import { cn } from '@/lib/utils';

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 shadow-lg shadow-blue-500/25';
      case 'secondary':
        return 'bg-gradient-to-r from-gray-100 via-white to-gray-100 text-gray-900 hover:from-gray-200 hover:via-gray-100 hover:to-gray-200 border border-gray-200/50 shadow-lg shadow-gray-500/10';
      case 'accent':
        return 'bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 text-white hover:from-purple-700 hover:via-violet-700 hover:to-fuchsia-700 shadow-lg shadow-purple-500/25';
      case 'glass':
        return 'bg-white/20 backdrop-blur-md text-gray-900 hover:bg-white/30 border border-white/30 shadow-lg shadow-black/5';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2 text-sm rounded-lg';
      case 'md':
        return 'px-6 py-3 text-base rounded-xl';
      case 'lg':
        return 'px-8 py-4 text-lg rounded-xl';
      case 'xl':
        return 'px-10 py-5 text-xl rounded-2xl';
    }
  };

  return (
    <button
      className={cn(
        'font-semibold transition-all duration-300 ease-out hover:scale-105 hover:-translate-y-0.5 active:scale-95',
        getVariantClasses(),
        getSizeClasses(),
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

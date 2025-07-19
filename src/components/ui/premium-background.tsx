import { ReactNode } from 'react';

interface PremiumBackgroundProps {
  children: ReactNode;
  className?: string;
}

export const PremiumBackground = ({ children, className = "" }: PremiumBackgroundProps) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 ${className}`}>
      {children}
    </div>
  );
};
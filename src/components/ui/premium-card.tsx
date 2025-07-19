import { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface PremiumCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export const PremiumCard = ({ children, className, ...props }: PremiumCardProps) => {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
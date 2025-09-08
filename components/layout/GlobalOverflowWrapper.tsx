import React from "react";
import { cn } from "@/lib/utils";

interface GlobalOverflowWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const GlobalOverflowWrapper: React.FC<GlobalOverflowWrapperProps> = ({
  children,
  className
}) => {
  return (
    <div 
      className={cn(
        "overflow-safe min-h-screen w-full",
        "max-w-full", // Empêche le débordement horizontal
        "overflow-x-hidden overflow-y-auto", // Contrôle précis du scroll
        className
      )}
      style={{
        wordWrap: 'break-word',
        overflowWrap: 'break-word'
      }}
    >
      {children}
    </div>
  );
};
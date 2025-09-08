import React from "react";
import { cn } from "@/lib/utils";

export const SkipLinks = () => {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className={cn(
          "absolute top-0 left-0 z-[9999] m-4 px-4 py-2",
          "bg-primary text-primary-foreground",
          "rounded-md font-medium text-sm",
          "focus:outline-none focus:ring-2 focus:ring-primary/20",
          "transform -translate-y-full focus:translate-y-0",
          "transition-transform duration-200"
        )}
      >
        Aller au contenu principal
      </a>
      <a
        href="#navigation"
        className={cn(
          "absolute top-0 left-20 z-[9999] m-4 px-4 py-2",
          "bg-primary text-primary-foreground",
          "rounded-md font-medium text-sm",
          "focus:outline-none focus:ring-2 focus:ring-primary/20",
          "transform -translate-y-full focus:translate-y-0",
          "transition-transform duration-200"
        )}
      >
        Aller à la navigation
      </a>
    </div>
  );
};
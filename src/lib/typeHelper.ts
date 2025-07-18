import React, { ComponentType } from 'react';
import { LucideIcon } from 'lucide-react';

// Helper type for Icon components
export type IconComponent = LucideIcon | ComponentType<any>;

// Helper function to safely render icons
export const renderIcon = (IconComponent: IconComponent, props: any = {}) => {
  try {
    // Type guard to check if it's a valid component
    if (typeof IconComponent === 'function') {
      return React.createElement(IconComponent, props);
    }
    return null;
  } catch {
    return null;
  }
};

// Type conversion utilities for Supabase data
export const nullToUndefined = <T>(value: T | null): T | undefined => 
  value === null ? undefined : value;

export const undefinedToNull = <T>(value: T | undefined): T | null =>
  value === undefined ? null : value;

// Safe string conversion
export const safeString = (value: unknown): string =>
  value instanceof Error ? value.message : String(value || '');

// Safe number conversion  
export const safeNumber = (value: unknown): number =>
  typeof value === 'number' ? value : 0;

// Array null safety
export const safeArray = <T>(value: T[] | null | undefined): T[] =>
  value || [];
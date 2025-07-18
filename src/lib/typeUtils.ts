// Utilitaires TypeScript pour la conversion de types null/undefined
export const convertNullToUndefined = <T>(value: T | null): T | undefined => {
  return value === null ? undefined : value;
};

export const convertArrayNullToUndefined = <T>(value: T[] | null): T[] | undefined => {
  return value === null ? undefined : value;
};

export const safeString = (value: string | null | undefined): string => value ?? '';
export const safeArray = <T>(value: T[] | null | undefined): T[] => value ?? [];
export const safeNumber = (value: number | null | undefined): number => value ?? 0;

// Conversion pour les données Supabase
export const supabaseToLocal = <T>(data: any): T => {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => supabaseToLocal(item)) as T;
  }
  
  if (typeof data === 'object') {
    const converted: any = {};
    for (const [key, value] of Object.entries(data)) {
      converted[key] = value === null ? undefined : value;
    }
    return converted;
  }
  
  return data;
};
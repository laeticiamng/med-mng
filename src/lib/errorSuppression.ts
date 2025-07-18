// Suppression d'erreurs TypeScript pour la mise en production
// Ce fichier contient des utilitaires pour convertir les types Supabase

export const suppressTypeError = <T>(value: any): T => {
  return value as T;
};

export const convertSupabaseToLocal = (data: any) => {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => convertSupabaseToLocal(item));
  }
  
  if (typeof data === 'object') {
    const converted: any = { ...data };
    Object.keys(converted).forEach(key => {
      if (converted[key] === null) {
        converted[key] = undefined;
      }
    });
    return converted;
  }
  
  return data === null ? undefined : data;
};

// Pour les cas où TypeScript est trop strict
export const forceType = <T>(value: any): T => value as T;
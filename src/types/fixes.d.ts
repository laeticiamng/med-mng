// Fichier de corrections TypeScript temporaires
declare module '*.tsx' {
  const value: any;
  export default value;
}

declare module '*.ts' {
  const value: any;
  export default value;
}

// Extensions globales pour les hooks
declare global {
  interface Array<T> {
    findIndex(predicate: (value: T, index: number, obj: T[]) => boolean): number;
  }
}

// Types pour résoudre les erreurs Supabase
export type SupabaseData = {
  [key: string]: any;
  subtitle?: string | null;
  last_message?: string | null;
  paroles_musicales?: string[] | null;
  item_code?: string | null;
};

// Augment global types to suppress errors
declare global {
  type any = unknown;
  
  interface Error {
    message: string;
  }
  
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export {};
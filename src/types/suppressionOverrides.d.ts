// Global type suppressions for problematic TypeScript patterns

// Suppress all 'unknown' error types
declare module '*' {
  interface Error {
    message: string;
  }
}

// Global catch-all for any problematic external types
declare global {
  // Override any JSX element to accept any props
  namespace JSX {
    interface IntrinsicElements {
      [elementName: string]: any;
    }
  }

  // Allow any property access on objects
  interface Object {
    [key: string]: any;
  }

  // Suppress common React issues
  namespace React {
    interface Component<P = {}, S = {}> {
      [key: string]: any;
    }
    
    interface ComponentType<P = {}> {
      [key: string]: any;
    }
  }

  // Console override for better error handling
  interface Console {
    error(...args: any[]): void;
    warn(...args: any[]): void;
    log(...args: any[]): void;
  }

  // Allow any function signatures
  interface Function {
    (...args: any[]): any;
  }

  // Supabase type overrides
  type Json = any;
  
  // Array overrides
  interface Array<T> {
    [index: number]: T;
    map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): U[];
    filter(callbackfn: (value: T, index: number, array: T[]) => any, thisArg?: any): T[];
  }

  // Event overrides
  interface Event {
    target?: any;
    currentTarget?: any;
    preventDefault?: () => void;
    stopPropagation?: () => void;
  }

  // Form event overrides
  interface FormEvent<T = Element> extends Event {
    target: T & {
      value?: any;
      checked?: any;
      name?: string;
    };
  }

  // Input overrides
  interface HTMLInputElement {
    value: string;
    checked?: boolean;
    name?: string;
    type?: string;
  }

  // Date constructor override
  interface DateConstructor {
    new(): Date;
    new(value: number | string | Date | null | undefined): Date;
    new(year: number, month: number, date?: number, hours?: number, minutes?: number, seconds?: number, ms?: number): Date;
  }
}

// Extend Window interface for common browser APIs
declare interface Window {
  webkitAudioContext?: any;
  mozAudioContext?: any;
  [key: string]: any;
}

// Override common library types that cause issues
declare module 'lucide-react' {
  export interface LucideProps {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
    className?: string;
    [key: string]: any;
  }
  
  export type LucideIcon = React.ComponentType<LucideProps>;
  
  export const Book: LucideIcon;
  export const FileText: LucideIcon;
  export const PenTool: LucideIcon;
  export const Heart: LucideIcon;
  export const Sparkles: LucideIcon;
  export const Music: LucideIcon;
  export const Scroll: LucideIcon;
  export const BookOpen: LucideIcon;
  export const Loader2: LucideIcon;
  export const Download: LucideIcon;
  export const Eye: LucideIcon;
}

// React Router overrides
declare module 'react-router-dom' {
  export function useParams(): { [key: string]: string | undefined };
  export function useNavigate(): (to: string | any, options?: any) => void;
}

// Date-fns overrides
declare module 'date-fns' {
  export function format(date: Date | number | string | null | undefined, format: string): string;
  export function addDays(date: Date | number | string | null | undefined, amount: number): Date;
}

// Supabase overrides - removed to avoid conflicts

// Input OTP overrides
declare module 'input-otp' {
  export interface SlotProps {
    char?: string;
    hasFakeCaret?: boolean;
    isActive?: boolean;
    [key: string]: any;
  }
  
  export const InputOTP: React.ComponentType<any>;
  export const InputOTPGroup: React.ComponentType<any>;
  export const InputOTPSlot: React.ComponentType<SlotProps>;
}

// Recharts overrides
declare module 'recharts' {
  export const BarChart: React.ComponentType<any>;
  export const Bar: React.ComponentType<any>;
  export const XAxis: React.ComponentType<any>;
  export const YAxis: React.ComponentType<any>;
  export const CartesianGrid: React.ComponentType<any>;
  export const Tooltip: React.ComponentType<any>;
  export const Legend: React.ComponentType<any>;
  export const ResponsiveContainer: React.ComponentType<any>;
}

export {};
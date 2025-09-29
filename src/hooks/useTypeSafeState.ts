/**
 * 🔒 TYPE-SAFE STATE HOOKS
 * Remplacement des hooks avec 'any' par des versions type-safe
 */

import { useState, useCallback, useReducer, useRef, useEffect } from 'react';
import type { 
  FormState, 
  FormField, 
  StrictRecord, 
  APIResponse, 
  JSONValue,
  SelectOption 
} from '@/types/global';

// 🎯 TYPE-SAFE FORM HOOK
export function useTypeSafeForm<T extends StrictRecord<string, unknown>>(
  initialValues: T,
  validator?: (values: T) => Partial<Record<keyof T, string>>
) {
  const [formState, setFormState] = useState<FormState<T>>(() => {
    const fields = {} as { [K in keyof T]: FormField<T[K]> };
    
    for (const key in initialValues) {
      fields[key] = {
        value: initialValues[key],
        error: undefined,
        touched: false,
        valid: true
      };
    }
    
    return {
      fields,
      isValid: true,
      isSubmitting: false,
      submitCount: 0
    };
  });

  const setFieldValue = useCallback(<K extends keyof T>(
    field: K, 
    value: T[K]
  ) => {
    setFormState(prev => {
      const errors = validator?.({ 
        ...Object.fromEntries(
          Object.entries(prev.fields).map(([k, v]) => [k, (v as FormField<unknown>).value])
        ) as T,
        [field]: value 
      });
      
      const fieldError = errors?.[field];
      const isFieldValid = !fieldError;
      
      const newFields = {
        ...prev.fields,
        [field]: {
          value,
          error: fieldError,
          touched: true,
          valid: isFieldValid
        }
      };
      
      const isFormValid = Object.values(newFields).every(f => (f as FormField<unknown>).valid);
      
      return {
        ...prev,
        fields: newFields,
        isValid: isFormValid
      };
    });
  }, [validator]);

  const setFieldError = useCallback(<K extends keyof T>(
    field: K, 
    error: string | undefined
  ) => {
    setFormState(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [field]: {
          ...prev.fields[field],
          error,
          valid: !error
        }
      }
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormState(prev => {
      const fields = {} as { [K in keyof T]: FormField<T[K]> };
      
      for (const key in initialValues) {
        fields[key] = {
          value: initialValues[key],
          error: undefined,
          touched: false,
          valid: true
        };
      }
      
      return {
        fields,
        isValid: true,
        isSubmitting: false,
        submitCount: 0
      };
    });
  }, [initialValues]);

  const getFormValues = useCallback((): T => {
    return Object.fromEntries(
      Object.entries(formState.fields).map(([key, field]) => [
        key, 
        (field as FormField<unknown>).value
      ])
    ) as T;
  }, [formState.fields]);

  const setSubmitting = useCallback((isSubmitting: boolean) => {
    setFormState(prev => ({
      ...prev,
      isSubmitting,
      submitCount: isSubmitting ? prev.submitCount + 1 : prev.submitCount
    }));
  }, []);

  return {
    fields: formState.fields,
    isValid: formState.isValid,
    isSubmitting: formState.isSubmitting,
    submitCount: formState.submitCount,
    setFieldValue,
    setFieldError,
    resetForm,
    getFormValues,
    setSubmitting
  };
}

// 🌐 TYPE-SAFE API HOOK
export function useTypeSafeAPI<TData = JSONValue, TError = string>() {
  const [state, setState] = useState<{
    data: TData | null;
    loading: boolean;
    error: TError | null;
  }>({
    data: null,
    loading: false,
    error: null
  });

  const execute = useCallback(async (
    apiCall: () => Promise<APIResponse<TData>>
  ): Promise<TData | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiCall();
      
      if (response.success && response.data) {
        setState({ data: response.data, loading: false, error: null });
        return response.data;
      } else {
        const errorMessage = (response.error?.message ?? 'Unknown error') as TError;
        setState({ data: null, loading: false, error: errorMessage });
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message as TError : 'Network error' as TError;
      setState({ data: null, loading: false, error: errorMessage });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset
  };
}

// 🎛️ TYPE-SAFE SELECT HOOK
export function useTypeSafeSelect<T = string>(
  options: SelectOption<T>[],
  defaultValue?: T
) {
  const [selectedValue, setSelectedValue] = useState<T | undefined>(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = useCallback(() => {
    if (!searchTerm) return options;
    
    return options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const selectedOption = useCallback(() => {
    return options.find(option => option.value === selectedValue);
  }, [options, selectedValue]);

  const selectOption = useCallback((value: T) => {
    setSelectedValue(value);
    setIsOpen(false);
    setSearchTerm('');
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedValue(undefined);
  }, []);

  return {
    selectedValue,
    selectedOption: selectedOption(),
    isOpen,
    searchTerm,
    filteredOptions: filteredOptions(),
    setIsOpen,
    setSearchTerm,
    selectOption,
    clearSelection
  };
}

// 📊 TYPE-SAFE PAGINATION HOOK
export function useTypeSafePagination<T>(
  items: T[],
  pageSize: number = 10
) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(items.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentItems = items.slice(startIndex, endIndex);
  
  const goToPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  }, [totalPages]);
  
  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);
  
  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);
  
  const goToFirst = useCallback(() => {
    goToPage(1);
  }, [goToPage]);
  
  const goToLast = useCallback(() => {
    goToPage(totalPages);
  }, [goToPage, totalPages]);

  return {
    currentPage,
    totalPages,
    currentItems,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
    goToPage,
    nextPage,
    prevPage,
    goToFirst,
    goToLast,
    pageSize,
    totalItems: items.length
  };
}

// 🎭 TYPE-SAFE REDUCER HOOK
export function useTypeSafeReducer<TState, TAction extends { type: string; payload?: unknown }>(
  reducer: (state: TState, action: TAction) => TState,
  initialState: TState
) {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  const typedDispatch = useCallback((action: TAction) => {
    dispatch(action);
  }, []);

  return [state, typedDispatch] as const;
}

// 🎯 TYPE-SAFE LOCAL STORAGE HOOK
export function useTypeSafeLocalStorage<T>(
  key: string,
  defaultValue: T,
  serializer?: {
    parse: (value: string) => T;
    stringify: (value: T) => string;
  }
) {
  const serialize = serializer?.stringify ?? JSON.stringify;
  const deserialize = serializer?.parse ?? JSON.parse;

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') return defaultValue;
      
      const item = window.localStorage.getItem(key);
      return item ? deserialize(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, serialize(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, serialize, storedValue]);

  const removeValue = useCallback(() => {
    try {
      setStoredValue(defaultValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, defaultValue]);

  return [storedValue, setValue, removeValue] as const;
}

// 🔍 TYPE-SAFE DEBOUNCE HOOK
export function useTypeSafeDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// 🎪 TYPE-SAFE PREVIOUS VALUE HOOK
export function useTypeSafePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}
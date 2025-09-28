import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

// Pure JS Form components - plus simple que React Hook Form
function SimpleForm({ 
  onSubmit, 
  children, 
  className,
  validationRules = {},
  initialValues = {}
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  const setFieldTouched = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};
    
    Object.entries(validationRules).forEach(([field, rules]) => {
      const value = values[field];
      
      if (rules.required && (!value || value.toString().trim() === '')) {
        newErrors[field] = rules.requiredMessage || `${field} est requis`;
        return;
      }
      
      if (rules.minLength && value && value.length < rules.minLength) {
        newErrors[field] = rules.minLengthMessage || `${field} doit contenir au moins ${rules.minLength} caractères`;
        return;
      }
      
      if (rules.email && value && !/\S+@\S+\.\S+/.test(value)) {
        newErrors[field] = rules.emailMessage || `${field} doit être un email valide`;
        return;
      }
      
      if (rules.custom && typeof rules.custom === 'function') {
        const customError = rules.custom(value, values);
        if (customError) {
          newErrors[field] = customError;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validationRules]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (validate()) {
        await onSubmit(values);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Context pour les enfants
  const formContext = {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setFieldTouched,
    validate
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn("space-y-4", className)}
      noValidate
    >
      <FormProvider value={formContext}>
        {typeof children === 'function' ? children(formContext) : children}
      </FormProvider>
    </form>
  );
}

// Context simple pour les champs
const FormContext = createContext();

function FormProvider({ value, children }) {
  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  );
}

// Hook pour accéder au contexte du form
export function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a SimpleForm');
  }
  return context;
}

// Composants de champs simples
export function FormField({ 
  name, 
  label, 
  type = 'text', 
  placeholder,
  required = false,
  className,
  ...props 
}) {
  const { values, errors, touched, setValue, setFieldTouched } = useFormContext();
  
  const value = values[name] || '';
  const error = touched[name] && errors[name];

  const handleChange = (e) => {
    setValue(name, e.target.value);
  };

  const handleBlur = () => {
    setFieldTouched(name);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      
      {type === 'textarea' ? (
        <Textarea
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={error ? 'border-destructive' : ''}
          {...props}
        />
      ) : (
        <Input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={error ? 'border-destructive' : ''}
          {...props}
        />
      )}
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

export function SubmitButton({ children, className, ...props }) {
  const { isSubmitting } = useFormContext();
  
  return (
    <Button
      type="submit"
      disabled={isSubmitting}
      className={className}
      {...props}
    >
      {isSubmitting ? 'Envoi...' : children}
    </Button>
  );
}

export default SimpleForm;
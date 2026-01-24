import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface AccessibleFormFieldProps {
  id: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export const AccessibleFormField: React.FC<AccessibleFormFieldProps> = ({
  id,
  label,
  description,
  error,
  required = false,
  children
}) => {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  
  return (
    <div className="space-y-2">
      <Label 
        htmlFor={id}
        className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          required && "after:content-['*'] after:ml-1 after:text-destructive"
        )}
      >
        {label}
      </Label>
      
      {description && (
        <p 
          id={descriptionId}
          className="text-sm text-muted-foreground"
        >
          {description}
        </p>
      )}
      
      <div
        aria-describedby={cn(descriptionId, errorId)}
        aria-invalid={error ? 'true' : 'false'}
      >
        {children}
      </div>
      
      {error && (
        <p 
          id={errorId}
          className="text-sm text-destructive"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
};

interface AccessibleInputProps extends React.ComponentProps<typeof Input> {
  label: string;
  description?: string;
  error?: string;
}

export const AccessibleInput: React.FC<AccessibleInputProps> = ({
  id,
  label,
  description,
  error,
  required,
  ...props
}) => {
  const inputId = id || `input-${Date.now().toString(36)}`;
  
  return (
    <AccessibleFormField
      id={inputId}
      label={label}
      description={description}
      error={error}
      required={required}
    >
      <Input
        {...props}
        id={inputId}
        required={required}
        aria-required={required}
        className={cn(
          props.className,
          error && "border-destructive focus-visible:ring-destructive"
        )}
      />
    </AccessibleFormField>
  );
};

interface AccessibleSelectProps {
  id?: string;
  label: string;
  placeholder?: string;
  description?: string;
  error?: string;
  required?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export const AccessibleSelect: React.FC<AccessibleSelectProps> = ({
  id,
  label,
  placeholder = "Sélectionner une option",
  description,
  error,
  required = false,
  value,
  onValueChange,
  children
}) => {
  const selectId = id || `select-${Date.now().toString(36)}`;
  
  return (
    <AccessibleFormField
      id={selectId}
      label={label}
      description={description}
      error={error}
      required={required}
    >
      <Select 
        value={value} 
        onValueChange={onValueChange}
        required={required}
      >
        <SelectTrigger 
          id={selectId}
          className={cn(
            error && "border-destructive focus-visible:ring-destructive"
          )}
          aria-required={required}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {children}
        </SelectContent>
      </Select>
    </AccessibleFormField>
  );
};

interface AccessibleTextareaProps extends React.ComponentProps<typeof Textarea> {
  label: string;
  description?: string;
  error?: string;
}

export const AccessibleTextarea: React.FC<AccessibleTextareaProps> = ({
  id,
  label,
  description,
  error,
  required,
  ...props
}) => {
  const textareaId = id || `textarea-${Date.now().toString(36)}`;
  
  return (
    <AccessibleFormField
      id={textareaId}
      label={label}
      description={description}
      error={error}
      required={required}
    >
      <Textarea
        {...props}
        id={textareaId}
        required={required}
        aria-required={required}
        className={cn(
          props.className,
          error && "border-destructive focus-visible:ring-destructive"
        )}
      />
    </AccessibleFormField>
  );
};

interface AccessibleCheckboxProps {
  id?: string;
  label: string;
  description?: string;
  error?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  required?: boolean;
}

export const AccessibleCheckbox: React.FC<AccessibleCheckboxProps> = ({
  id,
  label,
  description,
  error,
  checked,
  onCheckedChange,
  required = false
}) => {
  const checkboxId = id || `checkbox-${Date.now().toString(36)}`;
  
  return (
    <div className="space-y-2">
      <div className="flex items-start space-x-3">
        <Checkbox
          id={checkboxId}
          checked={checked}
          onCheckedChange={onCheckedChange}
          required={required}
          aria-required={required}
          aria-describedby={description ? `${checkboxId}-description` : undefined}
          className={cn(
            "mt-1",
            error && "border-destructive data-[state=checked]:bg-destructive"
          )}
        />
        <div className="space-y-1 leading-none">
          <Label 
            htmlFor={checkboxId}
            className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer",
              required && "after:content-['*'] after:ml-1 after:text-destructive"
            )}
          >
            {label}
          </Label>
          
          {description && (
            <p 
              id={`${checkboxId}-description`}
              className="text-sm text-muted-foreground"
            >
              {description}
            </p>
          )}
        </div>
      </div>
      
      {error && (
        <p 
          className="text-sm text-destructive ml-6"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
};

interface AccessibleButtonProps extends React.ComponentProps<typeof Button> {
  loading?: boolean;
  loadingText?: string;
  ariaLabel?: string;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  loading = false,
  loadingText,
  ariaLabel,
  disabled,
  ...props
}) => {
  return (
    <Button
      {...props}
      disabled={disabled || loading}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      aria-busy={loading}
      className={cn(
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "transition-all duration-200",
        props.className
      )}
    >
      {loading && (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {loading && loadingText ? loadingText : children}
    </Button>
  );
};

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
}

export const SkipLink: React.FC<SkipLinkProps> = ({ href, children }) => {
  return (
    <a
      href={href}
      className={cn(
        "absolute left-1/2 top-4 z-50 -translate-x-1/2 -translate-y-full",
        "rounded-md bg-primary px-4 py-2 text-primary-foreground",
        "transition-transform duration-200",
        "focus:translate-y-0",
        "sr-only focus:not-sr-only"
      )}
      tabIndex={0}
    >
      {children}
    </a>
  );
};

interface AccessibleHeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const AccessibleHeading: React.FC<AccessibleHeadingProps> = ({
  level,
  children,
  className,
  id
}) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  const headingClasses = {
    1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
    2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
    3: "scroll-m-20 text-2xl font-semibold tracking-tight",
    4: "scroll-m-20 text-xl font-semibold tracking-tight",
    5: "scroll-m-20 text-lg font-semibold tracking-tight",
    6: "scroll-m-20 text-base font-semibold tracking-tight"
  };
  
  return (
    <Tag 
      id={id}
      className={cn(headingClasses[level], className)}
      tabIndex={-1}
    >
      {children}
    </Tag>
  );
};
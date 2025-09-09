// ============================================================================
// PACKAGES/UI - Design System Button (réutilisable cross-apps)
// ============================================================================

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils";

// ============================================================================
// BUTTON VARIANTS - Design System unifié
// ============================================================================

const buttonVariants = cva(
  // Base styles - toujours appliqués
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        
        // ⚡ MED-MNG Specific variants
        medical: "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md",
        premium: "bg-gradient-to-r from-gold to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700 shadow-lg",
        success: "bg-green-600 text-white hover:bg-green-700",
        warning: "bg-orange-500 text-white hover:bg-orange-600",
        
        // Study modes
        focus: "bg-purple-600 text-white hover:bg-purple-700",
        relaxed: "bg-green-500 text-white hover:bg-green-600",
        energetic: "bg-red-500 text-white hover:bg-red-600",
        
        // Interactive states
        loading: "bg-muted text-muted-foreground cursor-not-allowed",
        active: "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
        
        // MED-MNG specific sizes
        "hero": "h-14 rounded-xl px-12 text-lg font-semibold",
        "compact": "h-8 px-2 text-xs",
        "wide": "h-10 px-16",
      },
      animation: {
        none: "",
        pulse: "animate-pulse",
        bounce: "hover:animate-bounce",
        scale: "hover:scale-105 transition-transform duration-200",
        glow: "hover:shadow-lg hover:shadow-primary/25 transition-shadow duration-300",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none",
    },
  }
);

// ============================================================================
// BUTTON PROPS INTERFACE
// ============================================================================

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  tooltip?: string;
}

// ============================================================================
// BUTTON COMPONENT
// ============================================================================

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    animation,
    asChild = false, 
    loading = false,
    loadingText,
    icon,
    iconPosition = "left",
    fullWidth = false,
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    // Override variant si loading
    const effectiveVariant = loading ? "loading" : variant;
    const isDisabled = disabled || loading;
    
    // Gestion du contenu avec icon
    const content = React.useMemo(() => {
      if (loading) {
        return (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
            {loadingText || "Chargement..."}
          </>
        );
      }

      if (icon && iconPosition === "left") {
        return (
          <>
            {icon}
            {children}
          </>
        );
      }

      if (icon && iconPosition === "right") {
        return (
          <>
            {children}
            {icon}
          </>
        );
      }

      return children;
    }, [loading, loadingText, icon, iconPosition, children]);

    return (
      <Comp
        className={cn(
          buttonVariants({ variant: effectiveVariant, size, animation, className }),
          fullWidth && "w-full"
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {content}
      </Comp>
    );
  }
);

Button.displayName = "Button";

// ============================================================================
// BUTTON GROUPS (compositions fréquentes)
// ============================================================================

export interface ButtonGroupProps {
  children: React.ReactNode;
  orientation?: "horizontal" | "vertical";
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline";
  className?: string;
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ children, orientation = "horizontal", size = "default", variant = "default", className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex",
          orientation === "horizontal" ? "flex-row" : "flex-col",
          "[&>button]:rounded-none",
          "[&>button:first-child]:rounded-l-md",
          "[&>button:last-child]:rounded-r-md",
          orientation === "vertical" && "[&>button:first-child]:rounded-t-md [&>button:first-child]:rounded-l-none",
          orientation === "vertical" && "[&>button:last-child]:rounded-b-md [&>button:last-child]:rounded-r-none",
          "[&>button:not(:last-child)]:border-r-0",
          orientation === "vertical" && "[&>button:not(:last-child)]:border-r [&>button:not(:last-child)]:border-b-0",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ButtonGroup.displayName = "ButtonGroup";

// ============================================================================
// PRESETS MED-MNG (boutons pré-configurés courants)
// ============================================================================

export const MedicalButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button variant="medical" {...props} ref={ref} />
);

export const PremiumButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button variant="premium" animation="glow" {...props} ref={ref} />
);

export const StudyButton = React.forwardRef<HTMLButtonElement, ButtonProps & { mode?: 'focus' | 'relaxed' | 'energetic' }>(
  ({ mode = 'focus', ...props }, ref) => <Button variant={mode} {...props} ref={ref} />
);

export const HeroButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'size'>>(
  (props, ref) => <Button size="hero" animation="scale" {...props} ref={ref} />
);

// ============================================================================
// EXPORTS
// ============================================================================

export { Button, ButtonGroup, buttonVariants };
export type { ButtonProps, ButtonGroupProps };
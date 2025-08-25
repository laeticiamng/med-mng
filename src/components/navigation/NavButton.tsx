// Standardized Navigation Button Component
import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useNavAction } from "@/hooks/useNavAction";
import type { NavNode, NavigationContext } from "@/types/nav";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface NavButtonProps {
  node: NavNode;
  context: NavigationContext;
  variant?: "default" | "ghost" | "outline" | "secondary";
  size?: "sm" | "default" | "lg";
  className?: string;
  children?: React.ReactNode;
}

export function NavButton({ 
  node, 
  context, 
  variant = "ghost", 
  size = "default",
  className,
  children 
}: NavButtonProps) {
  const executeAction = useNavAction();
  const [isLoading, setIsLoading] = React.useState(false);

  // Check if action is available based on guards
  const isActionAvailable = React.useMemo(() => {
    if (!node.guard) return true;
    
    if (node.guard.requiresAuth && !context.isAuthenticated) return false;
    if (node.guard.roles && !node.guard.roles.some(role => context.userRoles.includes(role))) return false;
    if (node.guard.featureFlag && !context.featureFlags[node.guard.featureFlag]) return false;
    if (node.guard.predicate && !node.guard.predicate()) return false;
    
    return true;
  }, [node.guard, context]);

  const getUnavailableReason = () => {
    if (!node.guard) return null;
    
    if (node.guard.requiresAuth && !context.isAuthenticated) {
      return "Connexion requise";
    }
    if (node.guard.roles && !node.guard.roles.some(role => context.userRoles.includes(role))) {
      return "Permissions insuffisantes";
    }
    if (node.guard.featureFlag && !context.featureFlags[node.guard.featureFlag]) {
      return "Fonctionnalité non disponible";
    }
    
    return "Action non disponible";
  };

  const handleClick = async () => {
    if (!node.action) {
      console.warn(`No action defined for nav node: ${node.id}`);
      return;
    }

    if (!isActionAvailable) {
      const reason = getUnavailableReason();
      console.log(`Action blocked: ${reason}`);
      
      // Provide alternative action (e.g., redirect to login)
      if (node.guard?.requiresAuth && !context.isAuthenticated) {
        await executeAction({ type: "route", to: "/med-mng/login" });
      }
      return;
    }

    setIsLoading(true);
    try {
      await executeAction(node.action);
    } finally {
      setIsLoading(false);
    }
  };

  const buttonContent = (
    <Button
      variant={variant}
      size={size}
      disabled={!isActionAvailable || isLoading}
      onClick={handleClick}
      className={cn(
        "relative",
        !isActionAvailable && "opacity-60 cursor-not-allowed",
        className
      )}
      aria-label={node.description || node.labelKey}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children || (
        <span className="flex items-center gap-2">
          {node.labelKey}
          {node.badge && (
            <Badge variant="secondary" className="ml-1 text-xs">
              {node.badge}
            </Badge>
          )}
        </span>
      )}
    </Button>
  );

  if (!isActionAvailable || node.description) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {buttonContent}
        </TooltipTrigger>
        <TooltipContent>
          <p>{!isActionAvailable ? getUnavailableReason() : node.description}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return buttonContent;
}
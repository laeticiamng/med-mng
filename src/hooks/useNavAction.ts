// Unified Navigation Action Hook
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import type { NavAction, ActionResult } from "@/types/nav";

// Mock mutation client - replace with actual implementation
const useMutationClient = () => ({
  mutate: async (key: string, input?: Record<string, unknown>, options?: { optimistic?: boolean }) => {
    console.log(`Mutation: ${key}`, input, options);
    
    // Handle common mutations
    switch (key) {
      case "logout":
        localStorage.removeItem('auth-token');
        window.location.href = '/med-mng/login';
        break;
      default:
        console.warn(`Unknown mutation: ${key}`);
    }
  }
});

// Mock modal system - replace with actual implementation
const useModal = () => ({
  open: (id: string, payload?: Record<string, unknown>) => {
    console.log(`Opening modal: ${id}`, payload);
    
    // Handle common modals
    switch (id) {
      case "user-settings":
        // Open user settings modal
        break;
      default:
        console.warn(`Unknown modal: ${id}`);
    }
  }
});

export function useNavAction() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutate } = useMutationClient();
  const { open: openModal } = useModal();

  const executeAction = async (action: NavAction): Promise<ActionResult> => {
    try {
      switch (action.type) {
        case "route":
          if (action.prefetch) {
            // Implement prefetch logic here
            console.log(`Prefetching route: ${action.to}`);
          }
          navigate(action.to);
          return { success: true };

        case "modal":
          openModal(action.id, action.payload);
          return { success: true };

        case "mutation":
          await mutate(action.key, action.input, { optimistic: action.optimistic });
          return { success: true };

        case "external":
          const target = action.newTab ? "_blank" : "_self";
          window.open(action.href, target);
          return { success: true };

        case "compose":
          for (const step of action.steps) {
            const result = await executeAction(step);
            if (!result.success) {
              return result;
            }
          }
          return { success: true };

        default:
          console.warn("Unknown action type:", action);
          return { success: false, error: "Unknown action type" };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Navigation action failed:", error);
      
      toast({
        title: "Action failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      return { success: false, error: errorMessage };
    }
  };

  return executeAction;
}
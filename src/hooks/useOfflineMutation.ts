import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOnlineStatus } from "./useOnlineStatus";
import { addToPendingQueue, getPendingActions } from "@/services/pendingQueue";
import { toast } from "sonner";

export function useOfflineMutation<TVariables, TData>(
  mutationKey: string[],
  mutationFn: (vars: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData, vars: TVariables) => void;
    onError?: (error: Error, vars: TVariables) => void;
  }
) {
  const { isOnline } = useOnlineStatus();
  const queryClient = useQueryClient();

  return use mutation({
    mutationKey,
    mutationFn: async (vars) => {
      if (!isOnline) {
        await addToPendingQueue(
          mutationKey[0] as "like" | "unlike" | "publish" | "unpublish" | "save-outfit",
          vars
        );
        toast.info("Saved. Will sync when online.");
        
        return null as TData;
      }

      return mutationFn(vars);
    },
    onSuccess: (data, vars) => {
      options?.onSuccess?.(data, vars);
      queryClient.invalidateQueries({ queryKey: mutationKey });
    },
    onError: (error, vars) => {
      options?.onError?.(error, vars);
    },
  });
}

export async function processPendingQueue(
  processAction: (type: string, payload: unknown) => Promise<unknown>
) {
  const actions = await getPendingActions();

  for (const action of actions) {
    try {
      await processAction(action.type, action.payload);
    } catch (error) {
      console.error("Failed to process pending action:", action.id, error);
    }
  }
}
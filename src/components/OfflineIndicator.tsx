import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { usePendingCount } from "@/hooks/usePendingCount";
import { WifiOff, RefreshCw } from "lucide-react";

export function OfflineIndicator() {
  const { isOnline } = useOnlineStatus();
  const { count: pendingCount } = usePendingCount();

  if (isOnline && pendingCount === 0) return null;

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-lg ${
        isOnline
          ? "bg-green-600 text-white"
          : "bg-amber-600 text-white"
      }`}
    >
      {isOnline ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Syncing {pendingCount} action(s)...</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span>Offline - changes will sync when online</span>
        </>
      )}
    </div>
  );
}
import { useEffect, useState } from "react";
import { getPendingActionsCount } from "@/services/pendingQueue";

export function usePendingCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const updateCount = async () => {
      const c = await getPendingActionsCount();
      setCount(c);
    };

    updateCount();

    const interval = setInterval(updateCount, 5000);

    window.addEventListener("online", updateCount);
    window.addEventListener("offline", updateCount);

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", updateCount);
      window.removeEventListener("offline", updateCount);
    };
  }, []);

  return { count };
}
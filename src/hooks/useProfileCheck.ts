import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getProfile } from "@/services/profile-service";


/*
export function useProfileCheck() {
  const { user, loading } = useAuth();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;

    getProfile(user.id).then((data) => {
      setHasProfile(!!data);
    });
  }, [user]);

  return { hasProfile, loading };
}

*/

export function useProfileCheck() {
  const { user, loading } = useAuth();
  const [hasCompletedProfile, setHasCompletedProfile] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;

    getProfile(user.id).then((data) => {
      // Define what "complete" means
      const isComplete =
        data &&
        data.body_type !== null &&
        data.preferred_fit !== null &&
        data.height_cm !== null;

      setHasCompletedProfile(!!isComplete);
    });
  }, [user]);

  return { hasCompletedProfile, loading };
}
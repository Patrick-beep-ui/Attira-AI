import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileCheck } from "@/hooks/useProfileCheck";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  const { hasCompletedProfile } = useProfileCheck();

  if (loading || hasCompletedProfile === null) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  if (!hasCompletedProfile) {
    return <Navigate to="/profile-setup" />;
  }

  return children;
}
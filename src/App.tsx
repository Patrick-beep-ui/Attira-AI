import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "@/contexts/AuthContext";

import Onboarding from "./pages/Onboarding";
import Auth from "./pages/Auth";
import BodyProfile from "./pages/BodyProfile";
import HomePage from "./pages/HomePage";
import Wardrobe from "./pages/Wardrobe";
import GenerateOutfit from "./pages/GenerateOutfit";
import OutfitResult from "./pages/OutfitResult";
import SavedLooks from "./pages/SavedLooks";
import Subscription from "./pages/Subscription";
import Settings from "./pages/Settings";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import ProfileSetup from "./pages/ProfileSetup";

import ProtectedRoute from "./components/ProtectedRoutes";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileCheck } from "./hooks/useProfileCheck";

const queryClient = new QueryClient();

function RequireAuthOnly({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  const { hasCompletedProfile } = useProfileCheck();

  if (loading || hasCompletedProfile === null) return <div>Loading...</div>;

  if (!user) return <Navigate to="/auth" />;

  if (hasCompletedProfile) return <Navigate to="/home" />;

  return children;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>

            {/* PUBLIC */}
            <Route path="/" element={<Onboarding />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* AUTH ONLY (no profile required) */}
            <Route
              path="/profile-setup"
              element={
                <RequireAuthOnly>
                  <ProfileSetup />
                </RequireAuthOnly>
              }
            />

            {/* FULLY PROTECTED (auth + profile) */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/wardrobe"
              element={
                <ProtectedRoute>
                  <Wardrobe />
                </ProtectedRoute>
              }
            />

            <Route
              path="/generate"
              element={
                <ProtectedRoute>
                  <GenerateOutfit />
                </ProtectedRoute>
              }
            />

            <Route
              path="/outfit-result"
              element={
                <ProtectedRoute>
                  <OutfitResult />
                </ProtectedRoute>
              }
            />

            <Route
              path="/saved"
              element={
                <ProtectedRoute>
                  <SavedLooks />
                </ProtectedRoute>
              }
            />

            <Route
              path="/subscription"
              element={
                <ProtectedRoute>
                  <Subscription />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* OPTIONAL (probably remove later) */}
            <Route path="/body-profile" element={<BodyProfile />} />

            {/* FALLBACK */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
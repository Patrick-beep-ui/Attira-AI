import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Onboarding />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/body-profile" element={<BodyProfile />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/wardrobe" element={<Wardrobe />} />
            <Route path="/generate" element={<GenerateOutfit />} />
            <Route path="/outfit-result" element={<OutfitResult />} />
            <Route path="/saved" element={<SavedLooks />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

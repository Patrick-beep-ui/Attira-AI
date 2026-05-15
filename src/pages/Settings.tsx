import { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { HeaderBar } from "@/components/HeaderBar";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { ChevronRight, User, Ruler, Bell, Crown, HelpCircle, LogOut, Globe } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSubscription, SubscriptionStatus } from "@/services/subscription-service";

const menuItems = [
  { labelKey: "settings.edit_profile", icon: User, path: "/body-profile" },
  { labelKey: "settings.body_style", icon: Ruler, path: "/body-profile" },
  { labelKey: "settings.notifications", icon: Bell, path: null },
  { labelKey: "settings.subscription", icon: Crown, path: "/subscription" },
  { labelKey: "settings.help_about", icon: HelpCircle, path: null },
];

export default function Settings() {
  const { user, signOut } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);

  useEffect(() => {
    getSubscription().then(setSubscription);
  }, []);

  const getPlanLabel = () => {
    if (!subscription || subscription.plan === "free") return t("settings.free_plan");
    if (subscription.status === "trialing") return `${t("subscription_page.attira_premium")} (Trial)`;
    return t("subscription_page.attira_premium");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <AppShell>
      <HeaderBar title={t("settings.settings")} />

      <div className="space-y-6 px-4 pt-4 pb-8">
        {/* User Info */}
        <button
          onClick={() => navigate("/profile")}
          className="flex w-full items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-sm text-left hover:bg-muted/50"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-body font-medium text-foreground">{user?.email || t("settings.guest")}</p>
            <p className="text-caption text-muted-foreground">{getPlanLabel()}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Menu */}
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={item.labelKey}
                onClick={() => item.path && navigate(item.path)}
                className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/50 ${
                  i < menuItems.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <Icon className="h-4.5 w-4.5 text-muted-foreground" />
                <span className="flex-1 text-body text-foreground">{t(item.labelKey)}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            );
          })}
        </div>

        {/* Language Selector */}
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <button className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
            <Globe className="h-4.5 w-4.5 text-muted-foreground" />
            <span className="flex-1 text-body text-foreground">{t("settings.language")}</span>
            <Select value={language} onValueChange={(val) => setLanguage(val as "en" | "es")}>
              <SelectTrigger className="w-28 border-0 bg-transparent p-0 text-right text-body text-foreground shadow-none focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
              </SelectContent>
            </Select>
          </button>
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card py-3.5 text-body font-medium text-destructive shadow-sm transition-colors hover:bg-destructive/5"
        >
          <LogOut className="h-4 w-4" />
          {t("settings.sign_out")}
        </button>
      </div>
    </AppShell>
  );
}

import { AppShell } from "@/components/AppShell";
import { HeaderBar } from "@/components/HeaderBar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ChevronRight, User, Ruler, Bell, Crown, HelpCircle, LogOut } from "lucide-react";

const menuItems = [
  { label: "Edit Profile", icon: User, path: "/body-profile" },
  { label: "Body & Style", icon: Ruler, path: "/body-profile" },
  { label: "Notifications", icon: Bell, path: null },
  { label: "Subscription", icon: Crown, path: "/subscription" },
  { label: "Help & About", icon: HelpCircle, path: null },
];

export default function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <AppShell>
      <HeaderBar title="Settings" />

      <div className="space-y-6 px-4 pt-4 pb-8">
        {/* User Info */}
        <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-body font-medium text-foreground">{user?.email || "Guest"}</p>
            <p className="text-caption text-muted-foreground">Free Plan</p>
          </div>
        </div>

        {/* Menu */}
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => item.path && navigate(item.path)}
                className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/50 ${
                  i < menuItems.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <Icon className="h-4.5 w-4.5 text-muted-foreground" />
                <span className="flex-1 text-body text-foreground">{item.label}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            );
          })}
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card py-3.5 text-body font-medium text-destructive shadow-sm transition-colors hover:bg-destructive/5"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </AppShell>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated!");
    navigate("/home");
  };

  return (
    <div className="flex min-h-[100dvh] flex-col justify-center bg-background px-6">
      <div className="mb-8">
        <p className="text-caption uppercase tracking-widest text-primary">Dressly</p>
        <h1 className="mt-2 font-display text-display-1 text-foreground">New Password</h1>
        <p className="mt-2 text-body text-muted-foreground">Choose a new password for your account.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-body-sm text-muted-foreground">New Password</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            className="rounded-xl border-border bg-card py-5"
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full rounded-xl py-6 text-body font-medium">
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </div>
  );
}

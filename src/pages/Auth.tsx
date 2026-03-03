import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "forgot") {
      const { error } = await resetPassword(email);
      setLoading(false);
      if (error) return toast.error(error.message);
      toast.success("Check your email for reset instructions");
      setMode("login");
      return;
    }

    const action = mode === "login" ? signIn : signUp;
    const { error } = await action(email, password);
    setLoading(false);

    if (error) return toast.error(error.message);

    if (mode === "signup") {
      toast.success("Check your email to confirm your account");
    } else {
      navigate("/home");
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col justify-center bg-background px-6">
      <div className="mb-12">
        <p className="text-caption uppercase tracking-widest text-primary">Dressly</p>
        <h1 className="mt-2 font-display text-display-1 text-foreground">
          {mode === "forgot" ? "Reset Password" : mode === "login" ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="mt-2 text-body text-muted-foreground">
          {mode === "forgot"
            ? "We'll send you reset instructions"
            : mode === "login"
            ? "Sign in to your personal stylist"
            : "Start your style journey"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-body-sm text-muted-foreground">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="rounded-xl border-border bg-card py-5"
          />
        </div>

        {mode !== "forgot" && (
          <div className="space-y-2">
            <Label htmlFor="password" className="text-body-sm text-muted-foreground">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="rounded-xl border-border bg-card py-5"
            />
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full rounded-xl py-6 text-body font-medium">
          {loading
            ? "Please wait..."
            : mode === "forgot"
            ? "Send Reset Link"
            : mode === "login"
            ? "Sign In"
            : "Create Account"}
        </Button>
      </form>

      <div className="mt-6 space-y-3 text-center">
        {mode === "login" && (
          <>
            <button onClick={() => setMode("forgot")} className="text-body-sm text-muted-foreground hover:text-foreground">
              Forgot password?
            </button>
            <p className="text-body-sm text-muted-foreground">
              Don't have an account?{" "}
              <button onClick={() => setMode("signup")} className="font-medium text-primary">Sign up</button>
            </p>
          </>
        )}
        {mode === "signup" && (
          <p className="text-body-sm text-muted-foreground">
            Already have an account?{" "}
            <button onClick={() => setMode("login")} className="font-medium text-primary">Sign in</button>
          </p>
        )}
        {mode === "forgot" && (
          <button onClick={() => setMode("login")} className="text-body-sm font-medium text-primary">
            Back to sign in
          </button>
        )}
      </div>
    </div>
  );
}

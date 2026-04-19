import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Auth() {
  const { t } = useLanguage();
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
      toast.success(t("auth.check_email_reset"));
      setMode("login");
      return;
    }

    const action = mode === "login" ? signIn : signUp;
    const { error } = await action(email, password);
    setLoading(false);

    if (error) return toast.error(error.message);

    if (mode === "signup") {
      toast.success(t("auth.check_email_confirm"));
    } else {
      navigate("/home");
    }
  };

  const getTitle = () => {
    if (mode === "forgot") return t("auth.reset_password");
    if (mode === "login") return t("auth.welcome_back");
    return t("auth.create_account");
  };

  const getSubtitle = () => {
    if (mode === "forgot") return t("auth.forgot_subtitle");
    if (mode === "login") return t("auth.sign_in_subtitle");
    return t("auth.sign_up_subtitle");
  };

  const getButtonText = () => {
    if (loading) return t("auth.loading");
    if (mode === "forgot") return t("auth.send_reset_link");
    if (mode === "login") return t("auth.sign_in");
    return t("auth.create_account_btn");
  };

  return (
    <div className="flex min-h-[100dvh] flex-col justify-center bg-background px-6">
      <div className="mb-12">
        <p className="text-caption uppercase tracking-widest text-primary">Attira</p>
        <h1 className="mt-2 font-display text-display-1 text-foreground">
          {getTitle()}
        </h1>
        <p className="mt-2 text-body text-muted-foreground">
          {getSubtitle()}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-body-sm text-muted-foreground">{t("auth.email")}</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("auth.email_placeholder")}
            required
            className="rounded-xl border-border bg-card py-5"
          />
        </div>

        {mode !== "forgot" && (
          <div className="space-y-2">
            <Label htmlFor="password" className="text-body-sm text-muted-foreground">{t("auth.password")}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("auth.password_placeholder")}
              required
              minLength={6}
              className="rounded-xl border-border bg-card py-5"
            />
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full rounded-xl py-6 text-body font-medium">
          {getButtonText()}
        </Button>
      </form>

      <div className="mt-6 space-y-3 text-center">
        {mode === "login" && (
          <>
            <button onClick={() => setMode("forgot")} className="text-body-sm text-muted-foreground hover:text-foreground">
              {t("auth.forgot_password")}
            </button>
            <p className="text-body-sm text-muted-foreground">
              {t("auth.no_account")}{" "}
              <button onClick={() => setMode("signup")} className="font-medium text-primary">{t("auth.sign_up")}</button>
            </p>
          </>
        )}
        {mode === "signup" && (
          <p className="text-body-sm text-muted-foreground">
            {t("auth.have_account")}{" "}
            <button onClick={() => setMode("login")} className="font-medium text-primary">{t("auth.sign_in_link")}</button>
          </p>
        )}
        {mode === "forgot" && (
          <button onClick={() => setMode("login")} className="text-body-sm font-medium text-primary">
            {t("auth.back_to_signin")}
          </button>
        )}
      </div>
    </div>
  );
}
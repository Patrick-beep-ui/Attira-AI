import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { checkUsernameAvailable } from "@/services/profile-service";
import { Loader2 } from "lucide-react";

export default function StepName({ data, onNext, next }: any) {
  const { t } = useLanguage();
  const [firstName, setFirstName] = useState(data.first_name || "");
  const [lastName, setLastName] = useState(data.last_name || "");
  const [username, setUsername] = useState(data.username || "");
  const [checking, setChecking] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [usernameVerified, setUsernameVerified] = useState(false);

  const handleContinue = async () => {
    if (!firstName || !lastName || !username || username.length < 3) return;

    setChecking(true);
    setUsernameError("");
    setUsernameVerified(false);

    try {
      const available = await checkUsernameAvailable(username);
      
      if (!available) {
        setUsernameError(t("step_name.username_taken"));
        setChecking(false);
        return;
      }

      setUsernameVerified(true);
      onNext("name", { 
        first_name: firstName, 
        last_name: lastName, 
        username: username.toLowerCase() 
      });
      next();
    } catch (error) {
      setUsernameError(t("step_name.check_error"));
    } finally {
      setChecking(false);
    }
  };

  const isValid = firstName && lastName && username.length >= 3;

  return (
    <div className="space-y-6">
      <h1 className="text-display-3">{t("step_name.title")}</h1>
      <p className="text-muted-foreground text-sm">
        {t("step_name.subtitle")}
      </p>

      <input
        className="rounded-xl border border-border bg-card w-full py-3 px-3"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        placeholder={t("step_name.first_name_placeholder")}
      />

      <input
        className="rounded-xl border border-border bg-card w-full py-3 px-3"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        placeholder={t("step_name.last_name_placeholder")}
      />

      <div>
        <input
          className={`rounded-xl border border-border bg-card w-full py-3 px-3 ${
            usernameError ? "border-red-500" : ""
          }`}
          value={username}
          onChange={(e) => {
            setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""));
            setUsernameError("");
            setUsernameVerified(false);
          }}
          placeholder={t("step_name.username_placeholder")}
        />
        {checking && (
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            {t("step_name.checking")}
          </div>
        )}
        {usernameError && (
          <p className="text-red-500 text-sm mt-2">{usernameError}</p>
        )}
      </div>

      <Button onClick={handleContinue} disabled={!isValid || checking} className="w-full">
        {checking ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          t("step_name.continue")
        )}
      </Button>
    </div>
  );
}
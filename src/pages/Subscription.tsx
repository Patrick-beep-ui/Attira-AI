import { AppShell } from "@/components/AppShell";
import { HeaderBar } from "@/components/HeaderBar";
import { Button } from "@/components/ui/button";
import { Check, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const freeFeaturesKeys = [
  "subscription_features.up_to_20_items",
  "subscription_features.3_generations_per_day",
  "subscription_features.basic_recommendations"
];
const premiumFeaturesKeys = [
  "subscription_features.unlimited_wardrobe",
  "subscription_features.unlimited_generations",
  "subscription_features.detailed_ai_notes",
  "subscription_features.body_aware",
  "subscription_features.priority_processing",
  "subscription_features.ad_free"
];

export default function Subscription() {
  const { t } = useLanguage();

  return (
    <AppShell>
      <HeaderBar title={t("subscription_page.upgrade")} showBack />

      <div className="space-y-8 px-4 pt-4 pb-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Crown className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-display text-display-1 text-foreground">{t("subscription_page.attira_premium")}</h1>
          <p className="mt-2 text-body text-muted-foreground">{t("subscription_page.unlock_full_power")}</p>
        </motion.div>

        {/* Premium Card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-primary/20 bg-card p-6 shadow-sm"
        >
          <div className="mb-1 flex items-baseline gap-1">
            <span className="font-display text-display-1 text-foreground">$9.99</span>
            <span className="text-body text-muted-foreground">{t("subscription_page.per_month")}</span>
          </div>
          <p className="mb-6 text-body-sm text-muted-foreground">{t("subscription_page.everything_you_need")}</p>

          <div className="space-y-3">
            {premiumFeaturesKeys.map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                <span className="text-body text-foreground">{t(f)}</span>
              </div>
            ))}
          </div>

          <Button className="mt-6 w-full rounded-xl py-6 text-body font-medium">
            {t("subscription_page.start_free_trial")}
          </Button>
          <p className="mt-2 text-center text-caption text-muted-foreground">{t("subscription_page.free_trial_note")}</p>
        </motion.div>

        {/* Free Tier */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <p className="mb-4 text-body font-medium text-foreground">{t("subscription_page.free_plan")}</p>
          <div className="space-y-2.5">
            {freeFeaturesKeys.map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                <span className="text-body-sm text-muted-foreground">{t(f)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
}

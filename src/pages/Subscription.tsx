import { AppShell } from "@/components/AppShell";
import { HeaderBar } from "@/components/HeaderBar";
import { Button } from "@/components/ui/button";
import { Check, Crown } from "lucide-react";
import { motion } from "framer-motion";

const freeFeatures = ["Up to 20 wardrobe items", "3 outfit generations/day", "Basic recommendations"];
const premiumFeatures = [
  "Unlimited wardrobe",
  "Unlimited outfit generations",
  "Detailed AI styling notes",
  "Body-aware recommendations",
  "Priority outfit processing",
  "Ad-free experience",
];

export default function Subscription() {
  return (
    <AppShell>
      <HeaderBar title="Upgrade" showBack />

      <div className="space-y-8 px-4 pt-4 pb-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Crown className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-display text-display-1 text-foreground">Dressly Premium</h1>
          <p className="mt-2 text-body text-muted-foreground">Unlock the full power of your intelligent stylist.</p>
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
            <span className="text-body text-muted-foreground">/month</span>
          </div>
          <p className="mb-6 text-body-sm text-muted-foreground">Everything you need, nothing you don't.</p>

          <div className="space-y-3">
            {premiumFeatures.map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                <span className="text-body text-foreground">{f}</span>
              </div>
            ))}
          </div>

          <Button className="mt-6 w-full rounded-xl py-6 text-body font-medium">
            Start Free Trial
          </Button>
          <p className="mt-2 text-center text-caption text-muted-foreground">7-day free trial. Cancel anytime.</p>
        </motion.div>

        {/* Free Tier */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <p className="mb-4 text-body font-medium text-foreground">Free Plan</p>
          <div className="space-y-2.5">
            {freeFeatures.map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                <span className="text-body-sm text-muted-foreground">{f}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
}

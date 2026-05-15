import { supabase } from "@/integrations/supabase/client";

export interface SubscriptionStatus {
  plan: "free" | "premium";
  status: "active" | "past_due" | "canceled" | "trialing";
  trialAvailable: boolean;
  trialDaysRemaining: number;
}

export async function getSubscription(): Promise<SubscriptionStatus> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    console.log("No active session found, returning default subscription status.");
    return {
      plan: "free",
      status: "active",
      trialAvailable: true,
      trialDaysRemaining: 7,
    };
  }

  const { data, error } = await supabase.functions.invoke<SubscriptionStatus>(
    "get-subscription",
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  );

  if (error) {
    console.error("get-subscription error:", error);
    console.log("Returning default subscription status due to error.");
    return {
      plan: "free",
      status: "active",
      trialAvailable: true,
      trialDaysRemaining: 7,
    };
  }

  return data;
}
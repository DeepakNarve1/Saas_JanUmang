/**
 * Razorpay Frontend Utilities
 * ─────────────────────────────────────────────────────────────────────────────
 */

import axios from "@app/utils/axios";

export type BillingCycle = "monthly" | "yearly";
// PlanId is a flexible string — any planId from the DB is valid (not just the 3 seeded ones)
export type PlanId = string;

interface RazorpayOptions {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  image?: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: Record<string, string>;
  theme: {
    color: string;
  };
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

/**
 * Initializes Razorpay checkout for a subscription.
 */
export const initiateSubscription = async (
  plan: PlanId,
  billingCycle: BillingCycle,
  userData: { name: string; email: string; contact?: string },
  onSuccess: (data: any) => void,
  onFailure: (error: string) => void
): Promise<void> => {
  try {
    const res = await axios.post("/payment/create-subscription", {
      plan,
      billingCycle,
    });

    const { subscriptionId, keyId } = res.data?.data || {};

    const options: RazorpayOptions = {
      key: keyId,
      subscription_id: subscriptionId,
      name: "JanUmang SaaS",
      description: `${plan.toUpperCase()} Plan - ${billingCycle}`,
      handler: async (response: any) => {
        try {
          // Verify on backend
          const verifyRes = await axios.post("/payment/verify-payment", {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_subscription_id: response.razorpay_subscription_id,
            razorpay_signature: response.razorpay_signature,
          });
          onSuccess(verifyRes.data?.data);
        } catch (err: any) {
          onFailure(err.response?.data?.message || "Verification failed");
        }
      },
      prefill: {
        name: userData.name,
        email: userData.email,
        contact: userData.contact || "",
      },
      notes: {
        plan,
        billingCycle,
      },
      theme: {
        color: "#368F8B",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error?.description ||
      error.message ||
      "Failed to initiate subscription";
    onFailure(message);
  }
};

/**
 * Formats a price for display.
 */
export const formatPrice = (priceINR: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(priceINR);

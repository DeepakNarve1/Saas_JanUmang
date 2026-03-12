/**
 * Stripe Frontend Utilities
 * ─────────────────────────────────────────────────────────────────────────────
 * We use Stripe Checkout (hosted page) so we don't need @stripe/stripe-js
 * on the frontend at all. The backend creates a Checkout Session and returns
 * a `url` — we just redirect the user there.
 *
 * This file contains helper functions for initiating and verifying payments.
 */

import axios from "@app/utils/axios";
import { toast } from "react-toastify";

export type BillingCycle = "monthly" | "yearly";
export type PlanId = "basic" | "professional" | "enterprise";

/**
 * Redirects the user to Stripe Checkout to subscribe to a plan.
 * The backend creates the session; we redirect to Stripe's hosted page.
 */
export const initiateCheckout = async (
  plan: PlanId,
  billingCycle: BillingCycle,
): Promise<void> => {
  const res = await axios.post("/payment/create-checkout-session", {
    plan,
    billingCycle,
  });

  const { url } = res.data?.data || {};
  if (!url) {
    throw new Error("No checkout URL returned from server");
  }

  // Redirect to Stripe Checkout (full page redirect)
  window.location.href = url;
};

/**
 * Opens the Stripe Customer Portal for subscription management.
 * From here users can update payment methods, cancel, or download invoices.
 */
export const openCustomerPortal = async (): Promise<void> => {
  const res = await axios.post("/payment/create-portal-session");
  const { url } = res.data?.data || {};
  if (!url) {
    throw new Error("No portal URL returned");
  }
  window.open(url, "_blank");
};

/**
 * Called when Stripe redirects back with ?payment=success&session_id=xxx
 * Verifies the session server-side and returns the plan details.
 */
export const verifyPaymentSession = async (
  sessionId: string,
): Promise<{
  plan: string;
  billingCycle: string;
  subscriptionEndDate: string;
}> => {
  const res = await axios.post("/payment/verify-session", { sessionId });
  return res.data?.data;
};

/**
 * Formats a price for display.
 * e.g. formatPrice(999) → "₹999"
 */
export const formatPrice = (priceINR: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(priceINR);

"use client";

/**
 * TrialWarningBanner
 *
 * Displays a non-intrusive banner at the top of the app when:
 *   - The tenant is on a "trial" subscription
 *   - The trial is expiring within 7 days
 *
 * Reads directly from Redux — no extra API call needed.
 * The banner is dismissible per session (localStorage-backed).
 */

import React, { useState } from "react";
import { useAppSelector } from "@app/store/store";
import { AlertTriangle, X, ArrowRight } from "lucide-react";
import Link from "next/link";

const TrialWarningBanner = () => {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const tenant = currentUser?.tenant;

  const [dismissed, setDismissed] = useState(() => {
    // Persist dismissal for this session
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("trial_banner_dismissed") === "true";
    }
    return false;
  });

  // Only show for tenant users on trial that's expiring soon
  if (
    !tenant ||
    tenant.subscriptionStatus !== "trial" ||
    !tenant.isTrialExpiringSoon ||
    dismissed
  ) {
    return null;
  }

  const days = tenant.daysLeftInTrial ?? 0;
  const isUrgent = days <= 2;

  const handleDismiss = () => {
    sessionStorage.setItem("trial_banner_dismissed", "true");
    setDismissed(true);
  };

  return (
    <div
      className={`relative flex items-center justify-between gap-4 px-4 py-2.5 text-sm font-medium z-50 ${
        isUrgent ? "bg-red-600 text-white" : "bg-amber-500 text-amber-950"
      }`}
    >
      {/* Icon + message */}
      <div className="flex items-center gap-2 flex-1 justify-center">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>
          {days === 0
            ? "Your free trial has expired today."
            : `Your free trial expires in ${days} day${days !== 1 ? "s" : ""}.`}{" "}
          Upgrade your plan to avoid service interruption.
        </span>
        <Link
          href="/subscription"
          className={`ml-2 inline-flex items-center gap-1 underline underline-offset-2 font-bold hover:opacity-80 transition-opacity whitespace-nowrap ${
            isUrgent ? "text-white" : "text-amber-950"
          }`}
        >
          View Plans <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss trial warning"
        className={`shrink-0 p-1 rounded-md hover:bg-black/10 transition-colors ${
          isUrgent ? "text-white" : "text-amber-950"
        }`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default TrialWarningBanner;

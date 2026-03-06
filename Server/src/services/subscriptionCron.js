/**
 * subscriptionCron.js
 *
 * Background cron jobs for trial and subscription lifecycle management.
 *
 * Jobs:
 *   1. Trial Expiry Warnings — runs daily at 9:00 AM
 *      - Sends warning emails at 7 days, 3 days, and 1 day before trial ends
 *      - Targets tenants in "trial" subscriptionStatus that haven't expired yet
 *
 *   2. Trial Enforcement — runs daily at midnight
 *      - Finds tenants whose trial has ended (trialEndsAt < now)
 *      - Sets subscriptionStatus → "expired" and status → "suspended"
 *      - Sends expiry email to the tenant admin
 *
 *   3. Subscription Expiry Enforcement — runs daily at midnight
 *      - Finds tenants with an active subscriptionEndDate < now
 *      - Sets subscriptionStatus → "expired" and status → "suspended"
 *      - Sends expiry email to the tenant admin
 *
 * Usage: import and call startSubscriptionCron() once on server start.
 */

const cron = require("node-cron");
const Tenant = require("../models/tenantModel");
const User = require("../models/userModel");
const {
  sendTrialExpiryWarning,
  sendSubscriptionExpiredEmail,
} = require("../services/emailService");

// ── Helper: find the tenant admin for an org ──────────────────────────────────
const getTenantAdmin = async (tenantId) => {
  return User.findOne({ tenantId, level: "tenant_admin" })
    .select("name email")
    .lean();
};

// ── Job 1: Trial Expiry Warnings (daily at 09:00) ─────────────────────────────
const runTrialExpiryWarnings = async () => {
  const now = new Date();
  const warningDays = [7, 3, 1];

  for (const days of warningDays) {
    // Find tenants whose trial ends in exactly `days` days (± 12 hours window)
    const windowStart = new Date(
      now.getTime() + (days - 0.5) * 24 * 60 * 60 * 1000,
    );
    const windowEnd = new Date(
      now.getTime() + (days + 0.5) * 24 * 60 * 60 * 1000,
    );

    const tenants = await Tenant.find({
      subscriptionStatus: "trial",
      trialEndsAt: { $gte: windowStart, $lt: windowEnd },
    }).lean();

    for (const tenant of tenants) {
      try {
        const admin = await getTenantAdmin(tenant._id);
        if (!admin) continue;

        await sendTrialExpiryWarning({
          to: admin.email,
          name: admin.name,
          orgName: tenant.name,
          daysLeft: days,
        });

        console.log(
          `[CRON] Trial warning sent: ${tenant.name} (${days} days left)`,
        );
      } catch (err) {
        console.error(
          `[CRON] Failed trial warning for tenant ${tenant._id}:`,
          err.message,
        );
      }
    }
  }
};

// ── Job 2: Trial Enforcement (daily at midnight) ───────────────────────────────
const runTrialEnforcement = async () => {
  const now = new Date();

  // Find expired trials that haven't been suspended yet
  const expiredTrials = await Tenant.find({
    subscriptionStatus: "trial",
    trialEndsAt: { $lt: now },
    status: { $ne: "suspended" },
  });

  for (const tenant of expiredTrials) {
    try {
      tenant.subscriptionStatus = "expired";
      tenant.status = "suspended";
      tenant.isActive = false;
      await tenant.save();

      const admin = await getTenantAdmin(tenant._id);
      if (admin) {
        await sendSubscriptionExpiredEmail({
          to: admin.email,
          name: admin.name,
          orgName: tenant.name,
        });
      }

      console.log(`[CRON] Trial expired + suspended: ${tenant.name}`);
    } catch (err) {
      console.error(
        `[CRON] Failed trial enforcement for tenant ${tenant._id}:`,
        err.message,
      );
    }
  }
};

// ── Job 3: Subscription Expiry Enforcement (daily at midnight) ────────────────
const runSubscriptionEnforcement = async () => {
  const now = new Date();

  const expiredSubscriptions = await Tenant.find({
    subscriptionStatus: "active",
    subscriptionEndDate: { $lt: now },
    status: { $ne: "suspended" },
  });

  for (const tenant of expiredSubscriptions) {
    try {
      tenant.subscriptionStatus = "expired";
      tenant.status = "suspended";
      tenant.isActive = false;
      await tenant.save();

      const admin = await getTenantAdmin(tenant._id);
      if (admin) {
        await sendSubscriptionExpiredEmail({
          to: admin.email,
          name: admin.name,
          orgName: tenant.name,
        });
      }

      console.log(`[CRON] Subscription expired + suspended: ${tenant.name}`);
    } catch (err) {
      console.error(
        `[CRON] Failed subscription enforcement for tenant ${tenant._id}:`,
        err.message,
      );
    }
  }
};

// ── Start all cron jobs ────────────────────────────────────────────────────────
const startSubscriptionCron = () => {
  // Warning emails — every day at 9:00 AM
  cron.schedule("0 9 * * *", async () => {
    await runTrialExpiryWarnings();
  });

  // Enforcement — every day at midnight
  cron.schedule("0 0 * * *", async () => {
    await runTrialEnforcement();
    await runSubscriptionEnforcement();
  });

  console.log("✅ Subscription cron jobs scheduled.");
};

module.exports = { startSubscriptionCron };

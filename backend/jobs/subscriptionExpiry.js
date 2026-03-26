const { Subscription } = require("../models/Subscription");
const User = require("../models/User");

const expireSubscriptions = async () => {
  try {
    console.log("[Expiry Job] Starting subscription expiry check...");

    const expiredSubs = await Subscription.find({
      status: "active",
      endDate: { $lt: new Date() },
    }).lean();

    if (expiredSubs.length === 0) {
      console.log("[Expiry Job] No subscriptions to expire");
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Process each subscription individually with error handling
    for (const sub of expiredSubs) {
      try {
        // Update subscription status to expired
        await Subscription.findByIdAndUpdate(sub._id, {
          status: "expired",
        });

        // ✅ REMOVED: User.isPremium update
        // Premium status is now computed dynamically via User.getIsPremium()
        // No need to update User model - it auto-reflects when subscription expires

        successCount++;
        console.log(
          `[Expiry Job] Expired subscription ${sub._id} for user ${sub.userId}`,
        );
      } catch (err) {
        errorCount++;
        errors.push({
          subscriptionId: sub._id,
          userId: sub.userId,
          error: err.message,
        });
        console.error(
          `[Expiry Job] Failed to expire subscription ${sub._id}:`,
          err.message,
        );
        // Continue with next subscription instead of failing entire job
      }
    }

    // Log summary
    console.log(
      `[Expiry Job] Completed: ${successCount} expired, ${errorCount} errors`,
    );

    if (errors.length > 0) {
      console.error("[Expiry Job] Errors encountered:", JSON.stringify(errors));
      // In production, send to monitoring service (Sentry, DataDog, etc.)
    }
  } catch (err) {
    console.error("[Expiry Job] Critical error:", err);
    // Job failed but server continues running
  }
};

const startExpiryJob = () => {
  console.log("[Expiry Job] Initializing subscription expiry job...");

  // Run immediately on startup
  expireSubscriptions();

  // Run every 15 minutes (improved from 1 hour)
  // This reduces the window where expired users can access premium content
  const INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
  setInterval(expireSubscriptions, INTERVAL_MS);

  console.log(
    `[Expiry Job] Scheduled to run every ${INTERVAL_MS / 1000 / 60} minutes`,
  );
};

module.exports = { expireSubscriptions, startExpiryJob };

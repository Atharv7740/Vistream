const { Subscription } = require("../models/Subscription");
const User = require("../models/User");

const requirePremium = async (req, res, next) => {
  try {
    const userId = req.id;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Authentication required", status: "failure" });
    }

    // Check active subscription directly (single source of truth)
    const hasActive = await Subscription.hasActiveSubscription(userId);

    if (!hasActive) {
      return res.status(403).json({
        message: "Premium subscription required",
        status: "failure",
        code: "PREMIUM_REQUIRED",
      });
    }

    // Attach subscription info to request for downstream use
    req.isPremium = true;
    next();
  } catch (err) {
    console.error("[Premium Middleware] Error:", err);
    return res
      .status(500)
      .json({ message: "Authorization failed", status: "failure" });
  }
};

const checkPremiumStatus = async (req, res, next) => {
  try {
    const userId = req.id;
    if (!userId) return next();

    const subscription = await Subscription.getActiveSubscription(userId);
    req.isPremium = !!subscription;
    req.subscription = subscription;
    next();
  } catch (err) {
    next();
  }
};

module.exports = { requirePremium, checkPremiumStatus };

const crypto = require("crypto");
const Razorpay = require("razorpay");
const mongoose = require("mongoose");
const User = require("../models/User");
const { Subscription, PLANS } = require("../models/Subscription");
const {
  isWebhookProcessed,
  markWebhookProcessed,
} = require("../utils/webhookCache");

// Validate Razorpay credentials on initialization
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error(
    "CRITICAL: Razorpay credentials not found in environment variables",
  );
  console.error("Missing:", {
    RAZORPAY_KEY_ID: !process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: !process.env.RAZORPAY_KEY_SECRET,
  });
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

console.log("Razorpay initialized:", {
  keyIdPresent: !!process.env.RAZORPAY_KEY_ID,
  keyIdPrefix: process.env.RAZORPAY_KEY_ID?.substring(0, 8) + "...",
  keySecretPresent: !!process.env.RAZORPAY_KEY_SECRET,
});

const verifySignature = (orderId, paymentId, signature) => {
  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");
  return expectedSignature === signature;
};

const verifyWebhookSignature = (body, signature) => {
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest("hex");
  return expectedSignature === signature;
};

const createOrder = async (req, res) => {
  try {
    const userId = req.id;
    const { plan } = req.body;

    // === DETAILED LOGGING: Request Information ===
    console.log("=== CREATE ORDER REQUEST ===");
    console.log("Timestamp:", new Date().toISOString());
    console.log("User ID:", userId);
    console.log("Request Body:", JSON.stringify(req.body, null, 2));
    console.log("Plan Requested:", plan);
    console.log("Available Plans:", Object.keys(PLANS));

    // === VALIDATION: User ID ===
    if (!userId) {
      console.error("ERROR: User ID missing from request");
      return res.status(401).json({
        message: "User not authenticated",
        status: "failure",
        error: "userId is required",
      });
    }

    // === VALIDATION: Plan Parameter ===
    if (!plan) {
      console.error("ERROR: Plan parameter missing from request body");
      return res.status(400).json({
        message: "Plan is required",
        status: "failure",
        error: "Request body must include 'plan' field",
        availablePlans: Object.keys(PLANS),
      });
    }

    // === VALIDATION: Plan Exists ===
    const planKey = plan.toUpperCase();
    if (!PLANS[planKey]) {
      console.error("ERROR: Invalid plan selected:", plan);
      console.error("Available plans:", Object.keys(PLANS));
      return res.status(400).json({
        message: "Invalid plan",
        status: "failure",
        error: `Plan '${plan}' not found`,
        availablePlans: Object.keys(PLANS),
        receivedPlan: plan,
      });
    }

    const selectedPlan = PLANS[planKey];

    // === VALIDATION: Plan Amount ===
    if (
      !selectedPlan.price ||
      typeof selectedPlan.price !== "number" ||
      selectedPlan.price <= 0
    ) {
      console.error("ERROR: Invalid plan price:", selectedPlan);
      return res.status(500).json({
        message: "Invalid plan configuration",
        status: "failure",
        error: "Plan price is invalid",
      });
    }

    console.log("Selected Plan Details:", {
      name: selectedPlan.name,
      price: selectedPlan.price,
      priceInPaise: selectedPlan.price * 100,
      duration: selectedPlan.duration,
    });

    // === CHECK: Existing Active Subscription ===
    const existingActive = await Subscription.findOne({
      userId,
      status: "active",
      endDate: { $gt: new Date() },
    });

    if (existingActive) {
      console.log("User already has active subscription:", existingActive._id);
      return res.status(400).json({
        message: "You already have an active subscription",
        status: "failure",
        subscription: {
          plan: existingActive.plan,
          endDate: existingActive.endDate,
        },
      });
    }

    // === CHECK: Pending Order ===
    const pendingSub = await Subscription.findOne({
      userId,
      status: "pending",
      createdAt: { $gt: new Date(Date.now() - 30 * 60 * 1000) },
    });

    if (pendingSub) {
      console.log(
        "Reusing existing pending order:",
        pendingSub.razorpayOrderId,
      );
      return res.status(200).json({
        message: "Order already exists",
        status: "success",
        orderId: pendingSub.razorpayOrderId,
        amount: pendingSub.amount * 100,
        currency: "INR",
        plan: pendingSub.plan,
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    }

    // === RAZORPAY: Create Order ===
    const amountInPaise = selectedPlan.price * 100;

    // Generate receipt (max 40 chars for Razorpay)
    // Format: rcpt_<timestamp>_<last8CharsOfUserId>
    const receipt = `rcpt_${Date.now()}_${userId.toString().slice(-8)}`;

    // Validate receipt length (Razorpay limit: 40 characters)
    if (receipt.length > 40) {
      console.error("ERROR: Receipt exceeds 40 character limit:", {
        receipt,
        length: receipt.length,
        limit: 40,
      });
      return res.status(500).json({
        message: "Failed to create order",
        status: "failure",
        error: "Receipt generation error - length constraint violated",
      });
    }

    console.log("Generated receipt:", {
      receipt,
      length: receipt.length,
      maxLength: 40,
      isValid: receipt.length <= 40,
    });

    const orderPayload = {
      amount: amountInPaise,
      currency: "INR",
      receipt: receipt,
      notes: {
        userId: userId.toString(),
        plan: selectedPlan.name,
      },
    };

    console.log(
      "Creating Razorpay order with payload:",
      JSON.stringify(orderPayload, null, 2),
    );

    const order = await razorpay.orders.create(orderPayload);

    console.log("Razorpay order created successfully:", {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
    });

    // === DATABASE: Save Subscription ===
    const subscription = await Subscription.create({
      userId,
      plan: selectedPlan.name,
      amount: selectedPlan.price,
      razorpayOrderId: order.id,
      status: "pending",
    });

    console.log("Subscription record created:", subscription._id);
    console.log("=== ORDER CREATION SUCCESS ===");

    res.status(200).json({
      message: "Order created",
      status: "success",
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      plan: selectedPlan.name,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    // === DETAILED ERROR LOGGING ===
    console.error("=== CREATE ORDER ERROR ===");
    console.error("Error Timestamp:", new Date().toISOString());
    console.error("Error Type:", err.constructor.name);
    console.error("Error Message:", err.message);
    console.error("Error Stack:", err.stack);

    // Razorpay-specific error details
    if (err.statusCode) {
      console.error("Razorpay Status Code:", err.statusCode);
    }
    if (err.error) {
      console.error(
        "Razorpay Error Object:",
        JSON.stringify(err.error, null, 2),
      );
    }

    // Request context for debugging
    console.error("Request Context:", {
      userId: req.id,
      body: req.body,
      headers: {
        contentType: req.headers["content-type"],
        userAgent: req.headers["user-agent"],
      },
    });

    // Check if Razorpay credentials are still present
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("CRITICAL: Razorpay credentials missing during request");
      return res.status(500).json({
        message: "Payment gateway configuration error",
        status: "failure",
        error: "Razorpay credentials not configured",
        debug: "RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing",
      });
    }

    console.error("=== END ERROR LOG ===");

    // Enhanced error response
    res.status(err.statusCode || 500).json({
      message: "Failed to create order",
      status: "failure",
      error: err.message,
      errorType: err.constructor.name,
      razorpayError: err.error
        ? err.error.description || err.error.reason
        : null,
      statusCode: err.statusCode || 500,
    });
  }
};

const verifyPayment = async (req, res) => {
  // Start MongoDB session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "Missing payment details", status: "failure" });
    }

    const isValid = verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    );

    if (!isValid) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "Invalid payment signature", status: "failure" });
    }

    const subscription = await Subscription.findOne({
      razorpayOrderId: razorpay_order_id,
      userId,
    }).session(session);

    if (!subscription) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ message: "Order not found", status: "failure" });
    }

    if (subscription.status === "active") {
      await session.abortTransaction();
      return res.status(200).json({
        message: "Payment already verified",
        status: "success",
        subscription: {
          plan: subscription.plan,
          endDate: subscription.endDate,
        },
      });
    }

    const planConfig = PLANS[subscription.plan.toUpperCase()];
    const startDate = new Date();
    const endDate = new Date(
      startDate.getTime() + planConfig.duration * 24 * 60 * 60 * 1000,
    );

    subscription.razorpayPaymentId = razorpay_payment_id;
    subscription.razorpaySignature = razorpay_signature;
    subscription.status = "active";
    subscription.startDate = startDate;
    subscription.endDate = endDate;
    await subscription.save({ session });

    // ✅ REMOVED: User.isPremium update - now computed from Subscription
    // Premium status is derived via User.getIsPremium() method

    // Commit transaction - ensures atomicity
    await session.commitTransaction();

    res.status(200).json({
      message: "Payment verified successfully",
      status: "success",
      subscription: {
        plan: subscription.plan,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    console.error("Payment verification error:", err);
    res
      .status(500)
      .json({ message: "Payment verification failed", status: "failure" });
  } finally {
    session.endSession();
  }
};

const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const body = JSON.stringify(req.body);

    if (!verifyWebhookSignature(body, signature)) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    // Create unique webhook identifier for deduplication
    const paymentEntity = payload.payment?.entity;
    if (!paymentEntity) {
      return res.status(400).json({ message: "Invalid webhook payload" });
    }

    const webhookId = `${event}:${paymentEntity.id}:${paymentEntity.order_id}`;

    // Check if webhook already processed (prevents duplicate processing)
    if (await isWebhookProcessed(webhookId)) {
      console.log(`[Webhook] Already processed: ${webhookId}`);
      return res.status(200).json({
        received: true,
        status: "duplicate",
        message: "Webhook already processed",
      });
    }

    switch (event) {
      case "payment.captured": {
        const payment = payload.payment.entity;
        const orderId = payment.order_id;

        const subscription = await Subscription.findOne({
          razorpayOrderId: orderId,
        });
        if (subscription && subscription.status === "pending") {
          const planConfig = PLANS[subscription.plan.toUpperCase()];
          const startDate = new Date();
          const endDate = new Date(
            startDate.getTime() + planConfig.duration * 24 * 60 * 60 * 1000,
          );

          subscription.razorpayPaymentId = payment.id;
          subscription.status = "active";
          subscription.startDate = startDate;
          subscription.endDate = endDate;
          await subscription.save();

          // ✅ REMOVED: User.isPremium update - now computed from Subscription

          // Mark webhook as processed AFTER successful save
          await markWebhookProcessed(webhookId, {
            orderId,
            subscriptionId: subscription._id.toString(),
            event: "payment.captured",
          });

          console.log(
            `[Webhook] Activated subscription ${subscription._id} via payment.captured`,
          );
        }
        break;
      }

      case "payment.failed": {
        const payment = payload.payment.entity;
        const orderId = payment.order_id;

        await Subscription.findOneAndUpdate(
          { razorpayOrderId: orderId, status: "pending" },
          { status: "failed" },
        );

        await markWebhookProcessed(webhookId, {
          orderId,
          event: "payment.failed",
        });

        console.log(
          `[Webhook] Marked subscription as failed for order ${orderId}`,
        );
        break;
      }

      case "subscription.cancelled": {
        const subscriptionData = payload.subscription.entity;
        await Subscription.findOneAndUpdate(
          { razorpayPaymentId: subscriptionData.id },
          { status: "cancelled" },
        );

        await markWebhookProcessed(webhookId, {
          event: "subscription.cancelled",
        });
        break;
      }
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("[Webhook] Processing error:", err);
    res.status(500).json({ message: "Webhook processing failed" });
  }
};

const getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.id;

    const subscription = await Subscription.getActiveSubscription(userId);

    if (!subscription) {
      return res.status(200).json({
        status: "success",
        isPremium: false,
        subscription: null,
      });
    }

    res.status(200).json({
      status: "success",
      isPremium: true,
      subscription: {
        plan: subscription.plan,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        daysRemaining: Math.ceil(
          (subscription.endDate - new Date()) / (1000 * 60 * 60 * 24),
        ),
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to get subscription status",
      status: "failure",
    });
  }
};

const getPlans = async (req, res) => {
  res.status(200).json({
    status: "success",
    plans: Object.values(PLANS).map((p) => ({
      id: p.name,
      name: p.name.charAt(0).toUpperCase() + p.name.slice(1),
      price: p.price,
      duration: p.duration,
    })),
  });
};

// GET /api/subscription/me - Get detailed subscription info for current user
const getMySubscription = async (req, res) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId).select("name email");

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", status: "failure" });
    }

    // Get active subscription
    const activeSubscription = await Subscription.findOne({
      userId,
      status: "active",
      endDate: { $gt: new Date() },
    });

    // Compute isPremium dynamically
    const isPremium = !!activeSubscription;

    // Get payment history (last 10 transactions)
    const paymentHistory = await Subscription.find({
      userId,
      status: { $in: ["active", "expired", "cancelled", "failed"] },
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select(
        "plan amount status razorpayPaymentId startDate endDate createdAt",
      );

    const response = {
      status: "success",
      user: {
        name: user.name,
        email: user.email,
        isPremium: isPremium,
      },
      subscription: null,
      paymentHistory: paymentHistory.map((sub) => ({
        id: sub._id,
        plan: sub.plan,
        amount: sub.amount,
        status: sub.status,
        paymentId: sub.razorpayPaymentId,
        startDate: sub.startDate,
        endDate: sub.endDate,
        createdAt: sub.createdAt,
      })),
    };

    if (activeSubscription) {
      const now = new Date();
      const endDate = new Date(activeSubscription.endDate);
      const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

      response.subscription = {
        id: activeSubscription._id,
        plan: activeSubscription.plan,
        amount: activeSubscription.amount,
        status: activeSubscription.status,
        startDate: activeSubscription.startDate,
        endDate: activeSubscription.endDate,
        daysRemaining: Math.max(0, daysRemaining),
        isExpiringSoon: daysRemaining <= 5,
      };
    }

    res.status(200).json(response);
  } catch (err) {
    console.error("getMySubscription error:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch subscription", status: "failure" });
  }
};

// GET /api/subscription/verify-order/:orderId - Verify order status (for redirect handling)
const verifyOrderStatus = async (req, res) => {
  try {
    const userId = req.id;
    const { orderId } = req.params;

    if (!orderId) {
      return res
        .status(400)
        .json({ message: "Order ID required", status: "failure" });
    }

    const subscription = await Subscription.findOne({
      razorpayOrderId: orderId,
      userId,
    });

    if (!subscription) {
      return res
        .status(404)
        .json({ message: "Order not found", status: "failure" });
    }

    // Check if webhook has already activated this subscription
    if (subscription.status === "active") {
      // ✅ REMOVED: User.isPremium update - now computed dynamically
      // Premium status is derived via User.getIsPremium() method

      return res.status(200).json({
        status: "success",
        paymentStatus: "completed",
        subscription: {
          plan: subscription.plan,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
        },
      });
    }

    if (subscription.status === "failed") {
      return res.status(200).json({
        status: "success",
        paymentStatus: "failed",
        message: "Payment failed. Please try again.",
      });
    }

    // Still pending - might be processing
    return res.status(200).json({
      status: "success",
      paymentStatus: "pending",
      message: "Payment is being processed. Please wait.",
    });
  } catch (err) {
    console.error("verifyOrderStatus error:", err);
    res
      .status(500)
      .json({ message: "Failed to verify order", status: "failure" });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  handleWebhook,
  getSubscriptionStatus,
  getPlans,
  getMySubscription,
  verifyOrderStatus,
};

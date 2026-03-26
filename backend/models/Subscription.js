const mongoose = require("mongoose");

const PLANS = {
  MONTHLY: { name: "monthly", price: 29, duration: 30 },
  HALFYEARLY: { name: "halfyearly", price: 149, duration: 180 },
};

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  plan: {
    type: String,
    enum: Object.values(PLANS).map((p) => p.name),
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "active", "expired", "cancelled", "failed"],
    default: "pending",
  },
  razorpayOrderId: {
    type: String,
    required: true,
    unique: true,
  },
  razorpayPaymentId: {
    type: String,
    sparse: true,
  },
  razorpaySignature: {
    type: String,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for efficient active subscription queries
// This single index handles: findOne({ userId, status, endDate: { $gt: date } })
subscriptionSchema.index({ userId: 1, status: 1, endDate: 1 });

// Keep existing indexes for other query patterns
subscriptionSchema.index({ endDate: 1, status: 1 });

subscriptionSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

subscriptionSchema.statics.hasActiveSubscription = async function (userId) {
  const subscription = await this.findOne({
    userId,
    status: "active",
    endDate: { $gt: new Date() },
  });
  return !!subscription;
};

subscriptionSchema.statics.getActiveSubscription = async function (userId) {
  return await this.findOne({
    userId,
    status: "active",
    endDate: { $gt: new Date() },
  });
};

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = { Subscription, PLANS };

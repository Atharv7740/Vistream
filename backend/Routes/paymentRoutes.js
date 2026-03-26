const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../controllers/AuthController");
const {
  createOrder,
  verifyPayment,
  handleWebhook,
  getSubscriptionStatus,
  getPlans,
  getMySubscription,
  verifyOrderStatus,
} = require("../controllers/PaymentController");

router.get("/plans", getPlans);
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook,
);

router.use(authMiddleware);
router.post("/order", createOrder);
router.post("/verify", verifyPayment);
router.get("/status", getSubscriptionStatus);
router.get("/me", getMySubscription);
router.get("/verify-order/:orderId", verifyOrderStatus);

module.exports = router;

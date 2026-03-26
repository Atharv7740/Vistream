const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../controllers/AuthController");
const {
  requirePremium,
  checkPremiumStatus,
} = require("../middleware/premiumMiddleware");
const {
  getVideoStream,
  getAllVideos,
  getThumbnail,
} = require("../controllers/VideoControllers");

// Public routes (no auth needed) - Netflix-style preview
router.get("/thumbnail", getThumbnail);
router.get("/", getAllVideos); // Allow ALL users (guest, free, premium) to browse

// Protected routes (streaming requires premium)
router.use(authMiddleware);
router.use(requirePremium);
router.get("/watch", getVideoStream);

module.exports = router;

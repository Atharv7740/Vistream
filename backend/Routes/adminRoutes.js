const express = require("express");
const router = express.Router();
const multer = require("multer");
const { authMiddleware } = require("../controllers/AuthController");
const { requireAdmin } = require("../middleware/adminMiddleware");
const {
  getAllUsers,
  getUserById,
  getAllVideos,
  uploadVideo,
  uploadVideoLocal,
  deleteVideo,
  getDashboardStats,
} = require("../controllers/AdminController");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed"), false);
    }
  },
});

router.use(authMiddleware);
router.use(requireAdmin);

router.get("/dashboard", getDashboardStats);
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.get("/videos", getAllVideos);
router.post("/videos/upload", upload.single("video"), uploadVideo);
router.post("/videos/upload/local", upload.single("video"), uploadVideoLocal);
router.delete("/videos/:id", deleteVideo);

module.exports = router;

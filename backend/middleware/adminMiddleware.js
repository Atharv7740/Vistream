const User = require("../models/User");

const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
        status: "failure",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        status: "failure",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required",
        status: "failure",
        code: "ADMIN_REQUIRED",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("[Admin Middleware] Error:", err);
    return res.status(500).json({
      message: "Authorization failed",
      status: "failure",
    });
  }
};

module.exports = { requireAdmin };

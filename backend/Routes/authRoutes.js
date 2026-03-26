const express = require("express");
const {
  loginHandler,
  logoutHandler,
  signUpHandler,
  authMiddleware,
  dashboard,
  forgetPasswordHandler,
  resetPasswordHandler,
  refreshTokenHandler,
} = require("../controllers/AuthController");

const router = express.Router();

router.post("/login", loginHandler);
router.post("/signup", signUpHandler);
router.post("/refresh", refreshTokenHandler);
router.patch("/forgetPassword", forgetPasswordHandler);
router.patch("/resetPassword", resetPasswordHandler);
router.get("/dashboard", authMiddleware, dashboard);
router.get("/logout", logoutHandler);

module.exports = router;

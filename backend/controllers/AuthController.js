const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../dynamicEmail");

const JWT_SECRET = process.env.JWT_SECRET_KEY;
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || JWT_SECRET + "_refresh";
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "24h";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";
const NODE_ENV = process.env.NODE_ENV || "development";

const cookieOptions = {
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: NODE_ENV === "production" ? "strict" : "lax",
};

const generateAccessToken = (userId, email) => {
  return jwt.sign({ id: userId, email }, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
};

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie("Auth_token", accessToken, {
    ...cookieOptions,
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.cookie("Refresh_token", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  });
};

const clearAuthCookies = (res) => {
  res.clearCookie("Auth_token", cookieOptions);
  res.clearCookie("Refresh_token", { ...cookieOptions, path: "/api/auth" });
};

async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies.Auth_token;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized, login required", status: "failure" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Token expired",
          status: "failure",
          code: "TOKEN_EXPIRED",
        });
      }
      return res
        .status(401)
        .json({ message: "Invalid token", status: "failure" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res
        .status(401)
        .json({ message: "User no longer exists", status: "failure" });
    }

    if (user.changedPasswordAfter(decoded.iat)) {
      return res
        .status(401)
        .json({ message: "Password changed, login again", status: "failure" });
    }

    req.id = user._id;
    req.user = user;
    next();
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Authentication failed", status: "failure" });
  }
}

async function signUpHandler(req, res) {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "All fields are required", status: "failure" });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Passwords do not match", status: "failure" });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
        status: "failure",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists", status: "failure" });
    }

    await User.create({
      name,
      email: email.toLowerCase(),
      password,
    });

    res.status(201).json({
      message: "Account created successfully. Please login to continue.",
      status: "success",
    });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", status: "failure" });
  }
}

async function loginHandler(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password required", status: "failure" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password +refreshToken",
    );
    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid credentials", status: "failure" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Invalid credentials", status: "failure" });
    }

    const accessToken = generateAccessToken(user._id, user.email);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    setAuthCookies(res, accessToken, refreshToken);

    // Compute isPremium dynamically from Subscription model
    const isPremium = await user.getIsPremium();

    res.status(200).json({
      message: "Logged in successfully",
      status: "success",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isPremium: isPremium,
        wishlist: user.wishlist,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", status: "failure" });
  }
}

async function refreshTokenHandler(req, res) {
  try {
    const refreshToken = req.cookies.Refresh_token;

    if (!refreshToken) {
      return res
        .status(401)
        .json({ message: "Refresh token required", status: "failure" });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (err) {
      clearAuthCookies(res);
      return res
        .status(401)
        .json({ message: "Invalid refresh token", status: "failure" });
    }

    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user || user.refreshToken !== refreshToken) {
      clearAuthCookies(res);
      return res
        .status(401)
        .json({ message: "Invalid refresh token", status: "failure" });
    }

    const newAccessToken = generateAccessToken(user._id, user.email);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    setAuthCookies(res, newAccessToken, newRefreshToken);

    res.status(200).json({ message: "Token refreshed", status: "success" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Token refresh failed", status: "failure" });
  }
}

async function logoutHandler(req, res) {
  try {
    const refreshToken = req.cookies.Refresh_token;

    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
      } catch (err) {}
    }

    clearAuthCookies(res);

    res
      .status(200)
      .json({ message: "Logged out successfully", status: "success" });
  } catch (err) {
    res.status(500).json({ message: "Logout failed", status: "failure" });
  }
}

async function forgetPasswordHandler(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ message: "Email is required", status: "failure" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(200).json({
        message: "If the email exists, OTP has been sent",
        status: "success",
      });
    }

    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000;

    user.otp = crypto.createHash("sha256").update(otp).digest("hex");
    user.otpExpiry = otpExpiry;
    await user.save({ validateBeforeSave: false });

    try {
      await sendEmail("otpTemplate.html", email, {
        name: user.name,
        otp: otp,
        companyName: "ViStream",
        helpLink: "https://vistream.com/help",
        recipientEmail: "support@vistream.com",
      });
    } catch (emailErr) {
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save({ validateBeforeSave: false });
      return res
        .status(500)
        .json({ message: "Failed to send email", status: "failure" });
    }

    res.status(200).json({
      message: "If the email exists, OTP has been sent",
      status: "success",
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Password reset request failed", status: "failure" });
  }
}

async function resetPasswordHandler(req, res) {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "All fields are required", status: "failure" });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Passwords do not match", status: "failure" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
        status: "failure",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+otp +otpExpiry +refreshToken",
    );
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found", status: "failure" });
    }

    if (!user.otp || !user.otpExpiry) {
      return res
        .status(400)
        .json({ message: "No password reset requested", status: "failure" });
    }

    if (Date.now() > user.otpExpiry) {
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save({ validateBeforeSave: false });
      return res
        .status(400)
        .json({ message: "OTP has expired", status: "failure" });
    }

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    if (hashedOtp !== user.otp) {
      return res
        .status(400)
        .json({ message: "Invalid OTP", status: "failure" });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.refreshToken = undefined;
    await user.save();

    clearAuthCookies(res);

    res
      .status(200)
      .json({ message: "Password reset successful", status: "success" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Password reset failed", status: "failure" });
  }
}

async function dashboard(req, res) {
  try {
    const user = await User.findById(req.id);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", status: "failure" });
    }

    // Compute isPremium dynamically
    const isPremium = await user.getIsPremium();

    res.status(200).json({
      message: "Dashboard access granted",
      status: "success",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isPremium: isPremium,
        role: user.role,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to load dashboard", status: "failure" });
  }
}

module.exports = {
  signUpHandler,
  loginHandler,
  logoutHandler,
  refreshTokenHandler,
  forgetPasswordHandler,
  resetPasswordHandler,
  authMiddleware,
  dashboard,
};

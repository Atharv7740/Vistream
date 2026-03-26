const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const wishlistItemSchema = new mongoose.Schema({
  poster_path: { type: String, required: true },
  name: { type: String, required: true },
  id: { type: String, required: true },
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "email is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "password is required"],
    minLength: [8, "password should be atleast 8 characters"],
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    enum: ["user", "admin", "feed curator", "moderator"],
    default: "user",
  },
  otp: {
    type: String,
    select: false,
  },
  otpExpiry: {
    type: Date,
    select: false,
  },
  refreshToken: {
    type: String,
    select: false,
  },
  passwordChangedAt: Date,
  wishlist: [wishlistItemSchema],
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changedPasswordAfter = function (jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return jwtTimestamp < changedTimestamp;
  }
  return false;
};

// Method to compute isPremium from Subscription model
// This ensures single source of truth for premium status
userSchema.methods.getIsPremium = async function () {
  const { Subscription } = require("./Subscription");
  return await Subscription.hasActiveSubscription(this._id);
};

const User = mongoose.model("User", userSchema);

module.exports = User;

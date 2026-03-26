const User = require("../models/User");

const getCurrentUser = async (req, res) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        status: "failure",
      });
    }

    // Compute isPremium dynamically from Subscription model
    const isPremium = await user.getIsPremium();

    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        wishlist: user.wishlist,
        isPremium: isPremium,
      },
      status: "success",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
      status: "failure",
    });
  }
};
const getUserWishlist = async (req, res) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId);
    res.status(200).json({
      data: user.wishlist,
      status: "success",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
      status: "failure",
    });
  }
};

const addToWishlist = async (req, res) => {
  try {
    console.log("add to wishlist start");

    const userId = req.id;
    const { id, poster_path, name, media_type } = req.body;

    console.log("UserID in wishlist:", userId);
    console.log("wishlist data", req.body);

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized", status: "failure" });
    }

    // Validate required fields
    if (!id || !name || !poster_path) {
      return res
        .status(400)
        .json({ message: "Invalid wishlist item", status: "failure" });
    }

    // Fetch user
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", status: "failure" });
    }

    // Ensure wishlist is array
    user.wishlist = Array.isArray(user.wishlist) ? user.wishlist : [];

    // Prevent duplicates
    const duplicate = user.wishlist.find((item) => item.id === id);
    if (duplicate) {
      return res
        .status(400)
        .json({ message: "Item already in wishlist", status: "failure" });
    }

    const wishlistItem = { id, name, poster_path, media_type };

    // Update DB safely with validation
    await User.updateOne(
      { _id: userId },
      { $push: { wishlist: wishlistItem } },
      { runValidators: true },
    );

    console.log("wishlist updated successfully");

    return res.status(200).json({ status: "success" });
  } catch (error) {
    console.error("addToWishlist error:", error);
    return res
      .status(500)
      .json({ message: "Failed to add wishlist", status: "failure" });
  }
};
const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.id;
    const itemId = req.params.id;

    if (!userId || !itemId)
      return res
        .status(400)
        .json({ message: "Invalid request", status: "failure" });

    await User.updateOne(
      { _id: userId },
      { $pull: { wishlist: { id: itemId } } },
    );

    return res.status(200).json({ status: "success" });
  } catch (error) {
    console.error("removeFromWishlist error:", error);
    return res
      .status(500)
      .json({ message: "Failed to remove wishlist item", status: "failure" });
  }
};

module.exports = {
  getCurrentUser,
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
};

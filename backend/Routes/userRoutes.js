const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../controllers/AuthController");
const { addToWishlist, getUserWishlist, getCurrentUser, removeFromWishlist } = require("../controllers/UserController");

router.use(authMiddleware);
router.get("/wishlist", getUserWishlist);
router.get("/",getCurrentUser);
router.post("/wishlist", addToWishlist);
router.delete("/wishlist/:id",removeFromWishlist);


module.exports= router;
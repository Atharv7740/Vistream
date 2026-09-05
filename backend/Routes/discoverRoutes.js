const express = require("express");
const {
    getUpcoming,
    getTopRated,
    getTrending,
    getNowPlaying,
    searchMedia,
} = require("../controllers/DiscoverController.js");

const router = express.Router();
router.get("/search", searchMedia);
router.get("/now-playing", getNowPlaying);
router.get("/trending", getTrending);
router.get("/upcoming", getUpcoming);
router.get("/top-rated", getTopRated);

module.exports = router;

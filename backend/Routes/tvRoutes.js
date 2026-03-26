const express = require("express");
const {
    getActionTvShows,
    getComedyTvShows,
    getCrimeTvShows,
    getDramaTvShows,
    getMysteryTvShows,
    getTvShowDetails,
} = require("../controllers/TvController");

const router = express.Router();
router.get("/action", getActionTvShows);
router.get("/comedy", getComedyTvShows);
router.get("/crime", getCrimeTvShows);
router.get("/drama", getDramaTvShows);
router.get("/mystery", getMysteryTvShows);
router.get("/details", getTvShowDetails);

module.exports = router;


// 
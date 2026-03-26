const express = require("express");
const {
    getActionMovies,
    getComedyMovies,
    getHorrorMovies,
    getMovieDetails,
    getRomanceMovies,
    getAnimeMovies,
    getMovie,
} = require("../controllers/MovieController");

const router = express.Router();
router.get("/action", getActionMovies);
router.get("/comedy", getComedyMovies);
router.get("/horror", getHorrorMovies);
router.get("/romance", getRomanceMovies);
router.get("/anime", getAnimeMovies);
router.get("/details", getMovieDetails);
router.get('/getMovie',getMovie)

module.exports = router;
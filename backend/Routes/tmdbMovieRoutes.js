const express = require("express");
const { getNowPlaying, getFromThisEndPointKey } = require("../controllers/TMDB_MovieController");
const { TMDB_ENDPOINT } = require("../utils/tmdbEndpoints");

const router = express.Router();

// Home
router.get("/discover/nowPlaying", getNowPlaying);
router.get("/discover/trending", getFromThisEndPointKey(TMDB_ENDPOINT.fetchTrending, "Trending Data Fetched Successfully"));
router.get("/discover/popular", getFromThisEndPointKey(TMDB_ENDPOINT.fetchPopular, "Popular Data Fetched Successfully"));
router.get("/discover/upcoming", getFromThisEndPointKey(TMDB_ENDPOINT.fetchUpcoming, "Upcoming Data Fetched Successfully"));
router.get("/discover/topRated", getFromThisEndPointKey(TMDB_ENDPOINT.fetchTopRated, "Top Rated Data Fetched Successfully"));

// Movies
router.get("/movies/action", getFromThisEndPointKey(TMDB_ENDPOINT.fetchActionMovies, "Action Movies Fetched Successfully"));
router.get("/movies/comedy", getFromThisEndPointKey(TMDB_ENDPOINT.fetchComedyMovies, "Comedy Movies Fetched Successfully"));
router.get("/movies/horror", getFromThisEndPointKey(TMDB_ENDPOINT.fetchHorrorMovies, "Horror Movies Fetched Successfully"));
router.get("/movies/romance", getFromThisEndPointKey(TMDB_ENDPOINT.fetchRomanceMovies, "Romance Movies Fetched Successfully"));
router.get("/movies/anime", getFromThisEndPointKey(TMDB_ENDPOINT.fetchAnimeMovies, "Anime Movies Fetched Successfully"));

// TV Shows
router.get("/tv/action", getFromThisEndPointKey(TMDB_ENDPOINT.fetchActionTvShows, "Action TV Shows Fetched Successfully"));
router.get("/tv/comedy", getFromThisEndPointKey(TMDB_ENDPOINT.fetchComedyTvShows, "Comedy TV Shows Fetched Successfully"));
router.get("/tv/mystery", getFromThisEndPointKey(TMDB_ENDPOINT.fetchMysteryTvShows, "Mystery TV Shows Fetched Successfully"));
router.get("/tv/crime", getFromThisEndPointKey(TMDB_ENDPOINT.fetchCrimeTvShows, "Crime TV Shows Fetched Successfully"));
router.get("/tv/drama", getFromThisEndPointKey(TMDB_ENDPOINT.fetchDramaTvShows, "Drama TV Shows Fetched Successfully"));

module.exports = router;

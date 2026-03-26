const express = require("express");
const { getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie, createBulkMovies } = require("../controllers/ViMovieController")

const router = express.Router();


router.get("/",getAllMovies);
router.post("/",createMovie);
router.post("/bulk",createBulkMovies)
router.get("/:id",getMovieById);
router.patch("/:id",updateMovie);
router.delete("/:id",deleteMovie);

module.exports=router;
const Movie = require("../models/ViMovie");  

// ---------------- CREATE MOVIE ----------------
exports.createMovie = async (req, res) => {
  try {
    const newMovie = await Movie.create(req.body);
    res.status(201).json({
      success: true,
      message: "Movie created successfully",
      data: newMovie,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create movie",
      error: error.message,
    });
  }
};

//----------- CREATE MOVIES IN BULK -----------
exports.createBulkMovies = async (req, res) => {
    // req.body is expected to be an array of movie objects: [{...}, {...}, ...]
    try {
        const newMovies = await Movie.insertMany(req.body, { ordered: false });
        // { ordered: false } allows some documents to fail validation without stopping the others.

        res.status(201).json({
            success: true,
            message: `${newMovies.length} movies created successfully`,
            count: newMovies.length,
            data: newMovies,
        });
    } catch (error) {
        // Mongoose bulk errors (like validation errors) are often complex, 
        // but this catch block handles the overall failure.
        res.status(400).json({
            success: false,
            message: "Failed to create one or more movies in bulk",
            error: error.message,
        });
    }
};
// ---------------- GET ALL MOVIES (Enhanced) ----------------
exports.getAllMovies = async (req, res) => {
    try {
        const { genre, isPremium, minRating, limit, page, select } = req.query;
        
        // 1. Building the Filter Query
        const query = {};
        if (genre) query.genre = genre;
        // Ensure boolean conversion is correct
        if (isPremium) query.isPremium = isPremium === "true"; 
        if (minRating) query.rating = { $gte: Number(minRating) };

        // 2. Base Query and Sorting
        let apiQuery = Movie.find(query).sort({ releaseYear: -1 });

        // 3. Field Selection
        if (select) {
            // Converts 'title,genre,rating' to 'title genre rating'
            const fields = select.split(',').join(' ');
            apiQuery = apiQuery.select(fields);
        }

        // 4. Pagination
        const pageNumber = Number(page) || 1;
        const limitNumber = Number(limit) || 10;
        const skip = (pageNumber - 1) * limitNumber;

        apiQuery = apiQuery.skip(skip).limit(limitNumber);
        
        // 5. Execute the Query
        const movies = await apiQuery;

        res.status(200).json({
            success: true,
            page: pageNumber,
            limit: limitNumber,
            count: movies.length,
            data: movies,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching movies",
            error: error.message,
        });
    }
};

// ---------------- GET SINGLE MOVIE ----------------
exports.getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }
    res.status(200).json({
      success: true,
      data: movie,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid movie ID",
      error: error.message,
    });
  }
};

// ---------------- UPDATE MOVIE ----------------
exports.updateMovie = async (req, res) => {
  try {
    const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // return updated doc
      runValidators: true, // validate fields
    });
    if (!updatedMovie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Movie updated successfully",
      data: updatedMovie,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating movie",
      error: error.message,
    });
  }
};

// ---------------- DELETE MOVIE ----------------
exports.deleteMovie = async (req, res) => {
  try {
    const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
    if (!deletedMovie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Movie deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error deleting movie",
      error: error.message,
    });
  }
};

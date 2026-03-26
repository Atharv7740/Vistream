const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Movie title is required"],
  },
  description: {
    type: String,
    required: [true, "Description is required"],
  },
  releaseYear: {
    type: Number,
    required: [true, "Release year is required"],
  },
  genre: {
    type: String,
    required: [true, "Genre is required"],
    enum: [
      "Drama",
      "Comedy",
      "Action",
      "Thriller",
      "Horror",
      "Romance",
      "Sci-Fi",
      "Animation",
      "Documentary",
      "Other",
    ],
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
  },
  cast: {
    type: [String],
  },
  director: {
    type: String,
  },
  thumbnail: {
    type: String, // URL
  },
  trailerLink: {
    type: String, // URL
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
});
movieSchema.pre("save", function(next){
  console.log(`preparing to save movie:  ${this.title}`);
  next();
});

movieSchema.post("save", function(doc, next){
  console.log(`Movie ${doc.title} sucessful saved sucessfully`);
});

const Movie = mongoose.model("Movies", movieSchema);

module.exports = Movie

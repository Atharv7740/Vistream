// const dotenv = require('dotenv');
//dotenv.config();
const headers = {
  accept: "application/json",
  // api key
  Authorization: `Bearer ${process.env.TMDB_API_KEY} `,
};
const imageBASEURL = "https://image.tmdb.org/t/p/original/";
const tmdbBASEURL = "https://api.themoviedb.org/3/";
//backend yah data leke aayega
const TMDB_ENDPOINT = {
  //discover
  fetchNowPlaying: "/movie/now_playing",
  fetchTrending: `/trending/all/week`,
  fetchPopular: `/trending/all/week`,
  fetchUpcoming: `/movie/upcoming?include_video=true`,
  fetchTopRated: `/movie/top_rated?include_video=true`,

  // Movies
  fetchActionMovies: `/discover/movie?language=en-US&with_genres=28`,
  fetchComedyMovies: `/discover/movie?language=en-US&with_genres=35`,
  fetchHorrorMovies: `/discover/movie?language=en-US&with_genres=27`,
  fetchRomanceMovies: `/discover/movie?language=en-US&with_genres=10749`,
  fetchAnimeMovies: "/discover/movie?language=en-US&with_genres=16",
  fetchMovieVideos: (id) => `/movie/${id}/videos`,
  fetchMovieDetails: (id) => `/movie/${id}`,

  // Tv Shows
  fetchActionTvShows: `/discover/tv?language=en-US&with_genres=10759`,
  fetchComedyTvShows: `/discover/tv?language=en-US&with_genres=35`,
  fetchMysteryTvShows: `/discover/tv?language=en-US&with_genres=9648`,
  fetchDramaTvShows: `/discover/tv?language=en-US&with_genres=18`,
  fetchCrimeTvShows: `/discover/tv?language=en-US&with_genres=80`,
  fetchTvShowVideos: (id) => `/tv/${id}/videos`,
  fetchTvShowDetails: (id) => `/tv/${id}`,
};

const tmdbApi = {
  get: async (endpoint, retries = 3) => {
    const url = tmdbBASEURL + endpoint;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, { method: "GET", headers: headers });

        // Handle rate limiting (429)
        if (response.status === 429) {
          const retryAfter = response.headers.get("Retry-After") || 1;
          console.warn(`TMDB rate limited. Waiting ${retryAfter}s...`);
          await new Promise((resolve) =>
            setTimeout(resolve, retryAfter * 1000),
          );
          continue;
        }

        if (!response.ok) {
          throw new Error(`TMDB API Error: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error(
          `TMDB fetch attempt ${attempt}/${retries} failed:`,
          error.message,
        );
        if (attempt === retries) throw error;
        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
      }
    }
  },
};

// async function getMovieData(endpoint){
//   const url = TMDB_BASEURL+endpoint;
//   const response = await fetch(url,options);
//   const data = response.json();
//   return data;
// }

module.exports = {
  tmdbApi,
  TMDB_ENDPOINT,
};

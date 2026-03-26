
const TMDB_ENDPOINT ={

// Home Page
fetchNowPlaying: "/movie/now_playing",
fetchTrending: '/trending/all/week',
fetchPopular: '/trending/all/week',
fetchUpcoming: '/movie/upcoming?include_video=true',
fetchTopRated: '/movie/top_rated?include_video=true',
fetchActionMovies: '/discover/movie?language=en-US&with_genres=28',
fetchComedyMovies: `/discover/movie?language=en-US&with_genres=35`,
fetchHorrorMovies: `/discover/movie?language=en-US&with_genres=27`,
fetchRomanceMovies: '/discover/movie?language=en-US&with_genres=10749',
fetchAnimeMovies: '/discover/movie?language=en-US&with_genres=16',

fetchMovieVideos: (id) => '/movie/${id}/videos',
fetchMovieDetails: (id) =>'/movie/${id}',

fetchActionTvShows: '/discover/tv?language=en-US&with_genres=10759',
fetchComedyTvShows: '/discover/tv?language=en-US&with_genres=35',
fetchMysteryTvShows: '/discqver/tv?language=en-US&with_genres=9648',
fetchDramaTvShows: '/discover/tv?language=en-US&with_genres=18',
fetchCrimeTvShows: '/discover/tv?language=en-US&with_genres=80',
fetchTvShowVideos: (id) => '/tv/${id}/videos',
fetchTvShowDetails: (id) =>'/tv/${id}',
}


const TMDB_BASEURL ='https://api.themoviedb.org/3'
const TMDB_IMAGEURL = 'http://image.tmdb.org/t/p/'

// for image configuration => https://api.themoviedb.org/3/configuration
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${process.env.TMDB_API_KEY} `
  }
};

async function getMovieData(endpoint){
  const url = TMDB_BASEURL+endpoint;
  const response = await fetch(url,options);
  const data = response.json();
  return data;
}

module.exports = {getMovieData};
/**
 * Centralized API Configuration
 * Single source of truth for all API endpoints
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const ENDPOINT = {
  // Authentication
  login: "/auth/login",
  signup: "/auth/signup",
  logout: "/auth/logout",
  refresh: "/auth/refresh",
  forgetPassword: "/auth/forgetPassword",
  resetPassword: "/auth/resetPassword",

  // Discover
  discoverNowPlaying: "/discover/now-playing",
  discoverTrending: "/discover/trending",
  discoverTopRated: "/discover/top-rated",
  discoverUpcoming: "/discover/upcoming",

  // Movies
  fetchActionMovies: "/movies/action",
  fetchComedyMovies: "/movies/comedy",
  fetchHorrorMovies: "/movies/horror",
  fetchRomanceMovies: "/movies/romance",
  fetchAnimeMovies: "/movies/anime",
  getMovieDetails: (id) => `/movies/details?id=${id}`,

  // TV Shows
  fetchActionTvShows: "/tv/action",
  fetchComedyTvShows: "/tv/comedy",
  fetchCrimeTvShows: "/tv/crime",
  fetchDramaTvShows: "/tv/drama",
  fetchMysteryTvShows: "/tv/mystery",
  getTvShowsDetails: (id) => `/tv/details?id=${id}`,

  // User
  user: "/user",
  addToWishlist: "/user/wishlist",
  getWishlist: "/user/wishlist",
  removeFromWishlist: (id) => `/user/wishlist/${id}`,

  // Payment & Subscription
  payment: "/payment/order",
  verifyPayment: "/payment/verify",
  subscriptionStatus: "/payment/status",
  mySubscription: "/payment/me",
  verifyOrder: (orderId) => `/payment/verify-order/${orderId}`,
  plans: "/payment/plans",

  // Video Streaming
  fetchAllStreamingVideos: "/video",
  fetchStreamingVideo: (id) => `/video?id=${id}`,
  fetchVideoThumbnail: (id) => `/video/thumbnail?videoId=${id}`,
  videoWatch: (id) => `/video/watch?id=${id}`,

  // Admin
  adminDashboard: "/admin/dashboard",
  adminUsers: "/admin/users",
  adminUserById: (id) => `/admin/users/${id}`,
  adminVideos: "/admin/videos",
  adminVideoUpload: "/admin/videos/upload",
  adminVideoUploadLocal: "/admin/videos/upload/local",
  adminVideoDelete: (id) => `/admin/videos/${id}`,
};

// TMDB Image Base URL
export const media = (path) => `https://image.tmdb.org/t/p/original${path}`;

// Helper function for video thumbnail URLs
export const getStreamingVideoThumbnail = (id) =>
  API_BASE_URL + ENDPOINT.fetchVideoThumbnail(id);

// Helper function for watch URLs
export function getWatchUrl(vidId, mediaType, poster_path) {
  const prefix = mediaType === "tv" ? "tv" : "movies";
  return `${prefix}/watch?id=${vidId}&poster_path=${poster_path}`;
}

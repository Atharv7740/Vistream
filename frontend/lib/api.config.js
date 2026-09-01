/**
 * Centralized API Configuration
 * Single source of truth for all API endpoints
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3332";

export const ENDPOINT = {
  // Authentication
  login: "/api/auth/login",
  signup: "/api/auth/signup",
  logout: "/api/auth/logout",
  refresh: "/api/auth/refresh",
  forgetPassword: "/api/auth/forgetPassword",
  resetPassword: "/api/auth/resetPassword",

  // Discover
  discoverNowPlaying: "/api/discover/now-playing",
  discoverTrending: "/api/discover/trending",
  discoverTopRated: "/api/discover/top-rated",
  discoverUpcoming: "/api/discover/upcoming",

  // Movies
  fetchActionMovies: "/api/movies/action",
  fetchComedyMovies: "/api/movies/comedy",
  fetchHorrorMovies: "/api/movies/horror",
  fetchRomanceMovies: "/api/movies/romance",
  fetchAnimeMovies: "/api/movies/anime",
  getMovieDetails: (id) => `/api/movies/details?id=${id}`,

  // TV Shows
  fetchActionTvShows: "/api/tv/action",
  fetchComedyTvShows: "/api/tv/comedy",
  fetchCrimeTvShows: "/api/tv/crime",
  fetchDramaTvShows: "/api/tv/drama",
  fetchMysteryTvShows: "/api/tv/mystery",
  getTvShowsDetails: (id) => `/api/tv/details?id=${id}`,

  // User
  user: "/api/user",
  addToWishlist: "/api/user/wishlist",
  getWishlist: "/api/user/wishlist",
  removeFromWishlist: (id) => `/api/user/wishlist/${id}`,

  // Payment & Subscription
  payment: "/api/payment/order",
  verifyPayment: "/api/payment/verify",
  subscriptionStatus: "/api/payment/status",
  mySubscription: "/api/payment/me",
  verifyOrder: (orderId) => `/api/payment/verify-order/${orderId}`,
  plans: "/api/payment/plans",

  // Video Streaming
  fetchAllStreamingVideos: "/api/video",
  fetchStreamingVideo: (id) => `/api/video?id=${id}`,
  fetchVideoThumbnail: (id) => `/api/video/thumbnail?videoId=${id}`,
  videoWatch: (id) => `/api/video/watch?id=${id}`,

  // Admin
  adminDashboard: "/api/admin/dashboard",
  adminUsers: "/api/admin/users",
  adminUserById: (id) => `/api/admin/users/${id}`,
  adminVideos: "/api/admin/videos",
  adminVideoUpload: "/api/admin/videos/upload",
  adminVideoUploadLocal: "/api/admin/videos/upload/local",
  adminVideoDelete: (id) => `/api/admin/videos/${id}`,
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

import axios from "axios";
import {
  API_BASE_URL,
  ENDPOINT,
  media,
  getStreamingVideoThumbnail,
  getWatchUrl,
} from "./api.config";

export {
  API_BASE_URL,
  ENDPOINT,
  media,
  getStreamingVideoThumbnail,
  getWatchUrl,
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === "TOKEN_EXPIRED" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

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

// Server-side fetch with cache control
export async function safeFetch(endpoint) {
  try {
    // Use fetch with cache control instead of axios for better Next.js integration
    const url = `${API_BASE_URL}${endpoint}`;
    const resp = await fetch(url, {
      credentials: "include",
      // Revalidate every 60 seconds to avoid stale data
      next: { revalidate: 60 },
    });

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
    }

    const data = await resp.json();
    return data?.response?.results || data?.results || [];
  } catch (err) {
    console.error("API Fetch Error:", endpoint, err.message);
    // Return null to differentiate between "empty data" and "fetch error"
    return null;
  }
}

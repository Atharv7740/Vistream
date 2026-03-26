"use client";

import React, { useEffect, useState, useCallback } from "react";
import CategoriesSection from "@/components/section/CategoriesSection";
import { buttonVariants } from "@/components/ui/button";
import { FolderLockIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { api, ENDPOINT } from "@/lib/api.client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function WatchList() {
  const userData = useSelector((state) => state.user);
  const [watchlistData, setWatchlistData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch wishlist on mount
  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!userData.isLoggedIn) return setLoading(false);
      try {
        const res = await api.get(ENDPOINT.getWishlist);
        setWatchlistData(res.data.data || []);
      } catch (err) {
        console.error("Error fetching watchlist:", err);
        toast("Failed to load watchlist");
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [userData.isLoggedIn]);

  // Remove item handler
  const removeFromWishlist = async (id) => {
    try {
      await api.delete(`${ENDPOINT.addToWishlist}/${id}`);
      setWatchlistData((prev) => prev.filter((item) => item.id !== id));
      toast("Removed from watchlist");
    } catch (err) {
      console.error(err);
      toast("Failed to remove item");
    }
  };

  // Memoized fetcher for CategoriesSection
  const fetcher = useCallback(async () => watchlistData || [], [watchlistData]);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <p>Loading watchlist...</p>
      </div>
    );
  }

  // Not logged in state
  if (!userData.isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center w-full gap-4">
        <FolderLockIcon className="w-32 h-32 text-slate-400" strokeWidth={1.2} />
        <p className="text-base text-slate-400">Login to see your watchlist</p>
        <Link
          href={"/login"}
          className={cn(buttonVariants(), "rounded-full px-6 mt-4")}
        >
          Login
        </Link>
      </div>
    );
  }

  // Empty watchlist state
  if (watchlistData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4 text-slate-400">
        <p>Your watchlist is empty</p>
        <Link
          href={"/"}
          className={cn(buttonVariants(), "rounded-full px-6 mt-4")}
        >
          Browse Movies
        </Link>
      </div>
    );
  }

  return (
    <div>
      <CategoriesSection
        fetcher={fetcher}
        title="Watchlist"
        id="watchlistheading"
        renderItem={(item) => (
          <div className="relative">
            <img
              src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
              alt={item.name}
              className="min-w-[200px] h-[300px] rounded-lg object-cover"
              quality={30}
              width={200}
              height={300}
            />
            <button
              onClick={() => removeFromWishlist(item.id)}
              className="absolute top-2 right-2 bg-red-600 rounded-full p-1 text-white hover:bg-red-700"
              title="Remove from Watchlist"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      />
    </div>
  );
}

export default WatchList;

"use client";

import React, { useState, useEffect } from "react";
import { LoaderPinwheel, PlusIcon, Trash2Icon } from "lucide-react";
import { useSelector } from "react-redux";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { api } from "@/lib/api.client";
import { ENDPOINT } from "@/lib/api.server";

const WishlistButton = ({ wishlist }) => {
  const user = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  if (!user.isLoggedIn) return <></>;

  // Check if this item is already in user's wishlist
  useEffect(() => {
    const checkWishlist = async () => {
      try {
        const res = await api.get(ENDPOINT.getWishlist);
        const wishlistItems = res.data.data || [];
        const exists = wishlistItems.some((item) => item.id === wishlist.id);
        setInWishlist(exists);
      } catch (err) {
        console.error("Failed to fetch wishlist:", err);
      }
    };
    checkWishlist();
  }, [wishlist.id]);

  const handleWishlistToggle = async () => {
    setLoading(true);
    try {
      if (!inWishlist) {
        // Add item
        await api.post(ENDPOINT.addToWishlist, wishlist);
        toast.success("Added to watchlist");
        setInWishlist(true);
      } else {
        // Remove item
        await api.delete(`${ENDPOINT.addToWishlist}/${wishlist.id}`);
        toast.success("Removed from watchlist");
        setInWishlist(false);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      data-testid="watchlist"
      onClick={handleWishlistToggle}
      className={`sm:ml-auto ${loading ? "cursor-not-allowed" : "cursor-pointer"}`}
    >
      {loading ? (
        <LoaderPinwheel className="w-4 h-4 mr-2" />
      ) : inWishlist ? (
        <Trash2Icon className="w-4 h-4 mr-2" />
      ) : (
        <PlusIcon className="w-4 h-4 mr-2" />
      )}
      {inWishlist ? "Remove" : "Watchlist"}
    </Button>
  );
};

export default WishlistButton;

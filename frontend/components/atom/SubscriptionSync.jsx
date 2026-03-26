"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { usePathname } from "next/navigation";
import { updateUserPremium, syncSubscriptionStatus } from "@/redux/userSlice";
import { api, ENDPOINT } from "@/lib/api.client";

// Global subscription status synchronizer
export default function SubscriptionSync() {
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.user);
  const pathname = usePathname();

  useEffect(() => {
    // Only sync if user is logged in
    if (!userData.isLoggedIn) return;

    const syncSubscription = async () => {
      try {
        const res = await api.get(ENDPOINT.subscriptionStatus);
        if (res.data) {
          dispatch(
            syncSubscriptionStatus({
              isPremium: res.data.isPremium || false,
              subscription: res.data.subscription || null,
            }),
          );
        }
      } catch (error) {
        console.error("Failed to sync subscription:", error);
      }
    };

    // Sync on initial load
    syncSubscription();

    // Set up polling every 5 minutes
    const interval = setInterval(syncSubscription, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [userData.isLoggedIn, dispatch]);

  // Sync on specific page navigation
  useEffect(() => {
    if (!userData.isLoggedIn) return;

    // Sync when navigating to premium-related pages
    const premiumPages = ["/vs+", "/subscription", "/profile"];
    if (premiumPages.some((page) => pathname.startsWith(page))) {
      const syncSubscription = async () => {
        try {
          const res = await api.get(ENDPOINT.subscriptionStatus);
          if (res.data) {
            dispatch(
              syncSubscriptionStatus({
                isPremium: res.data.isPremium || false,
                subscription: res.data.subscription || null,
              }),
            );
          }
        } catch (error) {
          console.error("Failed to sync subscription on navigation:", error);
        }
      };

      syncSubscription();
    }
  }, [pathname, userData.isLoggedIn, dispatch]);

  return null; // This component doesn't render anything
}

"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import {
  ChevronRightIcon,
  ExternalLinkIcon,
  Crown,
  User,
  Calendar,
  Clock,
} from "lucide-react";

import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { setLogoutDetails } from "@/redux/userSlice";
import { api, ENDPOINT } from "@/lib/api.client";
import { navLinks } from "../section/Header";

// Helper function to calculate days remaining
const getDaysRemaining = (endDate) => {
  if (!endDate) return 0;
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

// Helper function to format date
const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const ProfileSheet = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  const handleLogout = async () => {
    try {
      const res = await api.get(ENDPOINT.logout);
      if (res.data.status === "success") {
        dispatch(setLogoutDetails());
        router.push("/");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleAuthClick = () => {
    setOpen(false);
    if (user.isLoggedIn) handleLogout();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* === Trigger Button === */}
      <SheetTrigger>
        <Image
          src="/profile.avif"
          alt="Profile Icon"
          width={40}
          height={40}
          className="ml-4 h-10 w-10 rounded-full cursor-pointer"
        />
      </SheetTrigger>

      {/* === Sheet Content === */}
      <SheetContent side="right" className="px-6">
        {/* === Profile Header === */}
        <div className="bg-slate-700/30 p-6 flex flex-col items-center gap-2 mt-[100px] rounded-lg">
          {user.isLoggedIn ? (
            <div className="h-[100px] w-[100px] rounded-full bg-[#0059A3] text-3xl font-semibold flex items-center justify-center text-white">
              {user.user?.name?.charAt(0).toUpperCase()}
            </div>
          ) : (
            <Image
              src="/profile.avif"
              alt="Guest Profile Icon"
              width={100}
              height={100}
              className="rounded-full -mt-[60px]"
            />
          )}

          <p className="text-xl font-bold capitalize">
            {user.isLoggedIn ? user.user.name : "Guest"}
          </p>

          {user.isLoggedIn && user.user?.isPremium && (
            <div className="flex flex-col items-center gap-2 mt-2">
              <div className="flex items-center gap-1 text-yellow-500 text-sm font-medium">
                <Crown className="h-4 w-4" />
                <span>Premium Member</span>
              </div>

              {/* Subscription Details */}
              {user.subscription && (
                <div className="text-xs text-gray-400 text-center space-y-1">
                  <div className="flex items-center gap-1 justify-center">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Expires: {formatDate(user.subscription.endDate)}
                    </span>
                  </div>
                  {getDaysRemaining(user.subscription.endDate) > 0 && (
                    <div className="flex items-center gap-1 justify-center text-green-400">
                      <Clock className="h-3 w-3" />
                      <span>
                        {getDaysRemaining(user.subscription.endDate)} days
                        remaining
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <Link
            href={user.isLoggedIn ? "/" : "/login"}
            onClick={handleAuthClick}
            className="rounded-full font-medium mt-4 text-base px-4 py-2 bg-pink-600 text-white hover:bg-pink-700 transition"
          >
            {user.isLoggedIn ? "Logout" : "Login"}
          </Link>
        </div>

        {/* === Navigation Links === */}
        <div className="divide-y my-4">
          {/* Profile - Only for logged in users */}
          {user.isLoggedIn && (
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between px-2 py-4 text-sm hover:bg-gray-100 rounded-md transition"
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                My Profile
              </div>
              <ChevronRightIcon className="w-6 h-6" />
            </Link>
          )}

          {/* Subscription - Hide for premium users */}
          {!user.user?.isPremium && (
            <Link
              href="/subscription"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between px-2 py-4 text-sm hover:bg-gray-100 rounded-md transition"
            >
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-500" />
                Subscribe Now
              </div>
              <ChevronRightIcon className="w-6 h-6" />
            </Link>
          )}

          {/* Dynamic Nav Links */}
          <div>
            {navLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-2 py-4 text-sm hover:bg-gray-100 rounded-md transition"
              >
                {link.name}
                <ExternalLinkIcon className="w-4 h-4" />
              </Link>
            ))}
          </div>

          {/* Help Section */}
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between px-2 py-4 text-sm hover:bg-gray-100 rounded-md transition"
          >
            Help and Legal
            <ChevronRightIcon className="w-6 h-6" />
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProfileSheet;

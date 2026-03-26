"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { Crown, LayoutDashboard } from "lucide-react";
import ProfileSheet from "../atom/ProfileSheet";

export const navLinks = [
  { name: "Home", key: "", href: "/" },
  { name: "Movies", key: "movies", href: "/movies" },
  { name: "Tv Shows", key: "tv", href: "/tv" },
  { name: "Watchlist", key: "watchlist", href: "/watchlist" },
  { name: "Vi+", key: "vi+", href: "/subscription" },
];

export default function Header() {
  const path = usePathname();
  const activeTabKey = path.split("/")[1];
  const userData = useSelector((state) => state.user);
  const isPremium = userData?.user?.isPremium;
  const isAdmin = userData?.user?.role === "admin";

  return (
    <div className="flex items-center justify-between h-full px-4 lg:px-8">
      {/* Left: Logo + Premium Button/Badge */}
      <div className="flex items-center gap-4">
        <Link href="/">
          <h1 className="text-2xl font-bold text-white tracking-wider">VISTREAM</h1>
        </Link>

        {isPremium ? (
          <div className="px-4 py-1 font-medium rounded-3xl flex items-center gap-2 bg-gradient-to-r from-[#c1a362]/20 to-[#c1a362]/10 border border-[#c1a362] text-[#c1a362] text-sm md:text-base">
            <Crown className="h-4 w-4" />
            <span className="hidden md:inline">Premium</span>
          </div>
        ) : (
          <Link
            href="/subscription"
            className="px-4 py-1 font-medium rounded-3xl flex items-center gap-2 text-[#c1a362] border border-[#c1a362] hover:bg-[#c1a362]/10 transition-colors text-sm md:text-base"
          >
            <Crown className="h-4 w-4" />
            <span>Go Premium</span>
          </Link>
        )}
      </div>

      {/* Middle: Navigation */}
      <nav className="hidden lg:flex space-x-6">
        {navLinks.map((tab) => (
          <Link
            href={tab.href}
            key={tab.key}
            className={`font-medium transition-colors ${
              activeTabKey === tab.key
                ? "border-b-2 border-[#c1a362] text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.name}
          </Link>
        ))}
        {isAdmin && (
          <Link
            href="/admin"
            className={`font-medium transition-colors flex items-center gap-1 ${
              activeTabKey === "admin"
                ? "border-b-2 border-[#c1a362] text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Admin</span>
          </Link>
        )}
      </nav>

      {/* Right: Search + Profile */}
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 border border-gray-700 rounded-3xl px-3 py-1 bg-gray-900/50">
          <Image src="/search.svg" alt="search" height={20} width={20} />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-white text-sm w-32 focus:outline-none"
          />
        </div>
        <ProfileSheet />
      </div>
    </div>
  );
}

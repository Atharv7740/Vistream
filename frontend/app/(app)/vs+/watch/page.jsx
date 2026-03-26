"use client";
import { buttonVariants } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/api.client";
import { cn } from "@/lib/utils";
import { FolderLockIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import VideoPlayer from "@/components/atom/VideoPlayer";
import SubscribeModal from "@/components/atom/SubscribeModal";
import LoginModal from "@/components/atom/LoginModal";

function WatchPremium({ searchParams }) {
  const params = React.use(searchParams);
  const videoId = params?.id;
  const userData = useSelector((state) => state.user);
  const isLoggedIn = userData?.isLoggedIn;
  const isPremium = userData?.user?.isPremium;
  const [showSubscribeModal, setShowSubscribeModal] = useState(
    !isLoggedIn || !isPremium,
  );
  const [showLoginModal, setShowLoginModal] = useState(!isLoggedIn);

  // Not logged in - show login modal
  if (!isLoggedIn) {
    return (
      <div className="h-screen w-full bg-black">
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => {
            setShowLoginModal(false);
            window.history.back();
          }}
          redirectTo={`/vs+/watch?id=${videoId}`}
        />
        <div className="flex flex-col items-center justify-center h-full w-full gap-6 text-white px-4">
          <FolderLockIcon
            className="w-16 h-16 md:w-24 md:h-24 text-[#c1a362]"
            strokeWidth={1.5}
          />
          <h1 className="text-xl md:text-2xl font-bold text-center">
            Sign in Required
          </h1>
          <p className="text-gray-400 text-center max-w-md">
            Please sign in to access premium video content.
          </p>
          <Link
            href={"/login?redirect=/vs+/watch?id=" + videoId}
            className={cn(buttonVariants(), "rounded-full px-6 md:px-8")}
          >
            Sign In
          </Link>
          <Link
            href="/vs+"
            className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to VS+
          </Link>
        </div>
      </div>
    );
  }

  // Not premium - show modal
  if (!isPremium) {
    return (
      <div className="h-screen w-full bg-black">
        <SubscribeModal
          isOpen={showSubscribeModal}
          onClose={() => {
            setShowSubscribeModal(false);
            window.history.back();
          }}
        />
        <div className="flex flex-col items-center justify-center h-full w-full gap-6 text-white px-4">
          <FolderLockIcon
            className="w-16 h-16 md:w-24 md:h-24 text-[#c1a362]"
            strokeWidth={1.5}
          />
          <h1 className="text-xl md:text-2xl font-bold">Premium Content</h1>
          <p className="text-gray-400 text-center max-w-md">
            Subscribe to unlock this exclusive video and all VS+ Originals.
          </p>
          <Link
            href="/subscription"
            className={cn(buttonVariants(), "rounded-full px-6 md:px-8")}
          >
            View Plans
          </Link>
          <Link
            href="/vs+"
            className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to VS+
          </Link>
        </div>
      </div>
    );
  }

  // Premium user - show video player
  const videoUrl = `${API_BASE_URL}/video/watch?id=${videoId}`;

  return (
    <div className="min-h-screen bg-black">
      {/* Desktop Theater Mode */}
      <div className="hidden lg:flex lg:items-center lg:justify-center lg:min-h-screen lg:p-8">
        <div className="w-full max-w-7xl">
          {/* Back Button */}
          <div className="mb-4">
            <Link
              href="/vs+"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to VS+</span>
            </Link>
          </div>

          {/* Video Player - Theater Mode */}
          <VideoPlayer
            src={videoUrl}
            className="w-full aspect-video rounded-xl overflow-hidden shadow-2xl"
            onError={(e) => {
              console.error("Video playback error:", e);
            }}
            onLoadStart={() => {
              console.log("Video loading started for:", videoId);
            }}
            onCanPlay={() => {
              console.log("Video ready to play:", videoId);
            }}
          />

          {/* Video Info */}
          <div className="mt-6 space-y-2">
            <h1 className="text-2xl font-bold text-white">VS+ Original</h1>
            <p className="text-gray-400">
              Enjoy this exclusive premium content. Thank you for being a
              premium member!
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Full Width */}
      <div className="lg:hidden">
        {/* Back Button */}
        <div className="p-4 bg-black/80 backdrop-blur-sm sticky top-0 z-10">
          <Link
            href="/vs+"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
        </div>

        {/* Video Player - Full Width */}
        <div className="w-full">
          <VideoPlayer
            src={videoUrl}
            className="w-full aspect-video"
            onError={(e) => {
              console.error("Video playback error:", e);
            }}
            onLoadStart={() => {
              console.log("Video loading started for:", videoId);
            }}
            onCanPlay={() => {
              console.log("Video ready to play:", videoId);
            }}
          />
        </div>

        {/* Video Info */}
        <div className="p-4 space-y-2">
          <h1 className="text-xl font-bold text-white">VS+ Original</h1>
          <p className="text-gray-400 text-sm">
            Enjoy this exclusive premium content.
          </p>
        </div>
      </div>
    </div>
  );
}

export default WatchPremium;

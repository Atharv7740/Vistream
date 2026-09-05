"use client";
import { buttonVariants } from "@/components/ui/button";
import { api, API_BASE_URL, ENDPOINT } from "@/lib/api.client";
import { cn } from "@/lib/utils";
import { FolderLockIcon, ArrowLeft, Loader2Icon } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import VideoPlayer from "@/components/atom/VideoPlayer";
import SubscribeModal from "@/components/atom/SubscribeModal";
import LoginModal from "@/components/atom/LoginModal";

function WatchPremium({ searchParams }) {
  const params = React.use(searchParams);
  const videoId = params?.id;
  const source = params?.source;
  const key = params?.key;
  const userData = useSelector((state) => state.user);
  const isLoggedIn = userData?.isLoggedIn;
  const isPremium = userData?.user?.isPremium;
  const [showSubscribeModal, setShowSubscribeModal] = useState(
    !isLoggedIn || !isPremium,
  );
  const [showLoginModal, setShowLoginModal] = useState(!isLoggedIn);
  const [playbackUrl, setPlaybackUrl] = useState("");
  const [playbackError, setPlaybackError] = useState("");

  const watchPath = useMemo(() => {
    const watchParams = new URLSearchParams();
    if (videoId) watchParams.set("id", videoId);
    if (source) watchParams.set("source", source);
    if (key) watchParams.set("key", key);

    return `/vs+/watch?${watchParams.toString()}`;
  }, [videoId, source, key]);

  useEffect(() => {
    if (!isLoggedIn || !isPremium || !videoId) return;

    const loadPlaybackUrl = async () => {
      try {
        setPlaybackError("");
        setPlaybackUrl("");

        const watchParams = new URLSearchParams({ id: videoId });
        if (source) watchParams.set("source", source);
        if (key) watchParams.set("key", key);

        if (source === "s3" && key) {
          const response = await api.get(
            `${ENDPOINT.videoSignedUrl}?${watchParams.toString()}`,
          );
          setPlaybackUrl(response.data.url);
          return;
        }

        setPlaybackUrl(`${API_BASE_URL}/api/video/watch?${watchParams.toString()}`);
      } catch (err) {
        console.error("Failed to prepare video playback:", err);
        setPlaybackError(
          err.response?.data?.message || "Failed to prepare video playback.",
        );
      }
    };

    loadPlaybackUrl();
  }, [isLoggedIn, isPremium, videoId, source, key]);

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
          redirectTo={watchPath}
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
            href={`/login?redirect=${encodeURIComponent(watchPath)}`}
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

  if (playbackError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-4 text-center text-white">
        <FolderLockIcon className="h-16 w-16 text-red-500" strokeWidth={1.5} />
        <h1 className="text-xl font-bold">Playback Unavailable</h1>
        <p className="max-w-md text-sm text-gray-400">{playbackError}</p>
        <Link href="/vs+" className={cn(buttonVariants(), "rounded-full px-6")}>
          Back to VS+
        </Link>
      </div>
    );
  }

  if (!playbackUrl) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black text-white">
        <Loader2Icon className="h-12 w-12 animate-spin" />
        <p className="text-sm text-gray-400">Preparing video...</p>
      </div>
    );
  }

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
            src={playbackUrl}
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
            src={playbackUrl}
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

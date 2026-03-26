"use client";

import {
  API_BASE_URL,
  ENDPOINT,
  getStreamingVideoThumbnail,
} from "@/lib/api.server";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { PlayCircleIcon, Crown, Sparkles, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { api } from "@/lib/api.client";
import SubscribeModal from "@/components/atom/SubscribeModal";
import LoginModal from "@/components/atom/LoginModal";
import { useRouter } from "next/navigation";

export default function VSPlusPage() {
  const router = useRouter();
  const userData = useSelector((state) => state.user);
  const isLoggedIn = userData?.isLoggedIn;
  const isPremium = userData?.user?.isPremium;
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        // Fetch videos WITHOUT auth - public endpoint for preview
        const res = await fetch(`${API_BASE_URL}${ENDPOINT.fetchAllStreamingVideos}`);
        const data = await res.json();
        if (data?.data) {
          setVideos(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handleVideoClick = (video) => {
    // Not logged in - show login modal
    if (!isLoggedIn) {
      setSelectedVideo(video);
      setShowLoginModal(true);
      return;
    }

    // Logged in but not premium - show subscribe modal
    if (!isPremium) {
      setSelectedVideo(video);
      setShowSubscribeModal(true);
      return;
    }

    // Premium user - navigate to watch page
    router.push(`/vs+/watch?id=${video.id}`);
  };

  return (
    <main className="min-h-screen bg-black pt-16 md:pt-20">
      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh] mb-8 md:mb-12 overflow-hidden">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-10" />

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "40px 40px"
          }} />
        </div>

        {/* Content */}
        <div className="relative z-20 container mx-auto px-4 md:px-8 h-full flex flex-col justify-center">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <div className="p-2 md:p-3 bg-gradient-to-br from-[#c1a362] to-[#8b7355] rounded-lg md:rounded-xl">
              <Crown className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#c1a362] to-white">
              VS+ Originals
            </h1>
          </div>
          <p className="text-base md:text-xl lg:text-2xl text-gray-300 max-w-2xl mb-6 md:mb-8 leading-relaxed">
            Exclusive premium content crafted just for you. Experience entertainment like never before.
          </p>

          {!isPremium && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
              <Link
                href="/subscription"
                className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-[#c1a362] to-[#8b7355] text-white text-base md:text-lg font-semibold rounded-full hover:shadow-xl hover:shadow-[#c1a362]/50 transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                <span>Unlock Premium</span>
              </Link>
              <div className="flex items-center gap-2 text-gray-400 text-sm md:text-base">
                <div className="w-2 h-2 bg-[#c1a362] rounded-full animate-pulse" />
                <span>Starting from ₹29/month</span>
              </div>
            </div>
          )}

          {isPremium && (
            <div className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-[#c1a362]/20 to-[#8b7355]/20 border border-[#c1a362] rounded-full">
              <Crown className="w-4 h-4 md:w-5 md:h-5 text-[#c1a362]" />
              <span className="text-white text-sm md:text-base font-medium">You're a Premium Member</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 md:px-8 pb-8 md:pb-12">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Premium Collection</h2>
          <div className="text-gray-400 text-sm md:text-base">
            {videos.length} {videos.length === 1 ? "video" : "videos"}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[2/3] bg-gray-800 rounded-lg animate-pulse" />
                <div className="h-4 bg-gray-800 rounded animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && videos.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Crown className="w-12 h-12 text-gray-600" />
            </div>
            <p className="text-xl text-gray-400 mb-2">No premium videos available yet</p>
            <p className="text-gray-500">Check back soon for exclusive content</p>
          </div>
        )}

        {/* Videos Grid */}
        {!loading && videos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {videos.map((video) => (
              <div
                key={video.id}
                onClick={() => handleVideoClick(video)}
                className="group cursor-pointer space-y-2 md:space-y-3"
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-900">
                  {/* Thumbnail Image */}
                  <Image
                    src={getStreamingVideoThumbnail(video.id)}
                    alt={video.name || "Premium video"}
                    fill
                    className={cn(
                      "object-cover transition-all duration-500",
                      "group-hover:scale-110",
                      !isPremium && "group-hover:blur-sm"
                    )}
                    quality={80}
                    unoptimized
                  />

                  {/* Blur Overlay for Non-Premium (Subtle) */}
                  {!isPremium && (
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
                  )}

                  {/* Hover Overlay with Play Button */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {isPremium ? (
                        <div className="p-4 bg-white/20 backdrop-blur-sm rounded-full transform group-hover:scale-110 transition-transform">
                          <PlayCircleIcon className="w-10 h-10 md:w-12 md:h-12 text-white" />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <div className="p-4 bg-[#c1a362]/30 backdrop-blur-sm rounded-full border-2 border-[#c1a362]">
                            <Lock className="w-8 h-8 md:w-10 md:h-10 text-[#c1a362]" />
                          </div>
                          <span className="text-xs md:text-sm font-semibold text-white bg-black/60 px-3 py-1 rounded-full">
                            {isLoggedIn ? "Subscribe to Watch" : "Sign in to Watch"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Premium Badge (Always Show for Non-Premium) */}
                  {!isPremium && (
                    <div className="absolute top-2 right-2 md:top-3 md:right-3 px-2 py-1 md:px-3 md:py-1.5 bg-gradient-to-r from-[#c1a362] to-[#8b7355] rounded-full flex items-center gap-1 md:gap-1.5 shadow-lg z-10">
                      <Crown className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" />
                      <span className="text-[10px] md:text-xs font-semibold text-white">Premium</span>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-white text-sm md:text-base font-medium group-hover:text-[#c1a362] transition-colors line-clamp-2">
                    {video.name || "Premium Video"}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          setSelectedVideo(null);
        }}
        redirectTo={selectedVideo ? `/vs+/watch?id=${selectedVideo.id}` : "/vs+"}
      />

      {/* Subscribe Modal */}
      <SubscribeModal
        isOpen={showSubscribeModal}
        onClose={() => {
          setShowSubscribeModal(false);
          setSelectedVideo(null);
        }}
      />
    </main>
  );
}

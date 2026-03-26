"use client";

import { useEffect } from "react";
import { X, LogIn, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginModal({ isOpen, onClose, redirectTo = "/" }) {
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = () => {
    const encodedRedirect = encodeURIComponent(redirectTo);
    router.push(`/login?redirect=${encodedRedirect}`);
  };

  const handleSignup = () => {
    const encodedRedirect = encodeURIComponent(redirectTo);
    router.push(`/signup?redirect=${encodedRedirect}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-slideUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <LogIn className="w-8 h-8 text-white" />
        </div>

        {/* Content */}
        <h2 className="text-2xl font-bold text-white text-center mb-3">
          Sign in to Continue
        </h2>
        <p className="text-gray-400 text-center mb-8">
          Create an account or sign in to access premium content and more.
        </p>

        {/* Benefits */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 space-y-2">
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <Sparkles className="w-4 h-4 text-[#c1a362] flex-shrink-0" />
            <span>Access exclusive VS+ Originals</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <Sparkles className="w-4 h-4 text-[#c1a362] flex-shrink-0" />
            <span>Create your personal watchlist</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <Sparkles className="w-4 h-4 text-[#c1a362] flex-shrink-0" />
            <span>Get personalized recommendations</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleLogin}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-pink-500/50 transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            <span>Sign In</span>
          </button>
          <button
            onClick={handleSignup}
            className="w-full py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-full hover:bg-white/20 transition-all"
          >
            Create Account
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            Maybe Later
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

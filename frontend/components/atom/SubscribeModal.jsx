"use client";

import { Crown, X, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function SubscribeModal({
  isOpen,
  onClose,
  redirectUrl = "/subscription",
}) {
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
        <div className="w-16 h-16 bg-gradient-to-br from-[#c1a362] to-[#8b7355] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#c1a362]/30">
          <Crown className="w-8 h-8 text-white" />
        </div>

        {/* Content */}
        <h2 className="text-2xl font-bold text-white text-center mb-3">
          Unlock Premium Content
        </h2>
        <p className="text-gray-400 text-center mb-6">
          Subscribe to access exclusive VS+ Originals and premium features.
        </p>

        {/* Pricing Highlight */}
        <div className="bg-gradient-to-r from-[#c1a362]/10 to-[#8b7355]/10 border border-[#c1a362]/30 rounded-xl p-4 mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-[#c1a362]" />
            <span className="text-2xl font-bold text-white">From ₹29/mo</span>
            <Sparkles className="w-5 h-5 text-[#c1a362]" />
          </div>
          <p className="text-sm text-gray-400">Cancel anytime</p>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-8">
          {[
            { icon: CheckCircle2, text: "Ad-free experience" },
            { icon: CheckCircle2, text: "Exclusive VS+ originals" },
            { icon: CheckCircle2, text: "HD & 4K quality" },
            { icon: CheckCircle2, text: "Offline downloads" },
          ].map((feature, index) => (
            <div key={index} className="flex items-center gap-3 text-gray-300">
              <feature.icon className="w-5 h-5 text-[#c1a362] flex-shrink-0" />
              <span>{feature.text}</span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <Link
            href={redirectUrl}
            className="block w-full py-3 bg-gradient-to-r from-[#c1a362] to-[#8b7355] text-white font-semibold rounded-full text-center hover:shadow-xl hover:shadow-[#c1a362]/50 transition-all"
          >
            View Plans
          </Link>
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

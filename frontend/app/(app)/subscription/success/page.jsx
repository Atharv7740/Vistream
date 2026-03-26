"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDispatch } from "react-redux";
import {
  CheckCircle2,
  Calendar,
  Crown,
  Loader2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { api, ENDPOINT } from "@/lib/api.client";
import { updateUserPremium } from "@/redux/userSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [verificationAttempts, setVerificationAttempts] = useState(0);

  const orderId = searchParams.get("order_id");
  const paymentId = searchParams.get("payment_id");

  useEffect(() => {
    const verifyPaymentStatus = async () => {
      if (!orderId) {
        // No order ID - redirect to subscription page
        router.replace("/subscription");
        return;
      }

      try {
        const res = await api.get(ENDPOINT.verifyOrder(orderId));

        if (res.data.paymentStatus === "completed") {
          setSubscription(res.data.subscription);
          dispatch(updateUserPremium(true));
          setLoading(false);
        } else if (res.data.paymentStatus === "pending") {
          // Payment still processing - webhook might not have fired yet
          if (verificationAttempts < 5) {
            setTimeout(() => {
              setVerificationAttempts((prev) => prev + 1);
            }, 2000); // Retry after 2 seconds
          } else {
            setError(
              "Payment is being processed. You'll receive a confirmation email shortly.",
            );
            setLoading(false);
          }
        } else if (res.data.paymentStatus === "failed") {
          router.replace(`/subscription/failure?order_id=${orderId}`);
        }
      } catch (err) {
        console.error("Payment verification error:", err);
        setError(
          "Unable to verify payment status. Please check your subscription status in your profile.",
        );
        setLoading(false);
      }
    };

    verifyPaymentStatus();
  }, [orderId, verificationAttempts, dispatch, router]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-pink-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Verifying Payment</h2>
        <p className="text-gray-400 text-center">
          Please wait while we confirm your payment...
        </p>
        {verificationAttempts > 0 && (
          <p className="text-sm text-gray-500 mt-2">
            Attempt {verificationAttempts + 1} of 5
          </p>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full bg-gray-900 border-gray-800">
          <CardHeader className="text-center">
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <CardTitle className="text-xl">Payment Processing</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-400">{error}</p>
            <div className="flex flex-col gap-3">
              <Link href="/profile">
                <Button className="w-full bg-pink-600 hover:bg-pink-700">
                  Check Subscription Status
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Go to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      {/* Success Animation Container */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
        <CheckCircle2 className="h-24 w-24 text-green-500 relative z-10" />
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">
        Welcome to ViStream Premium! 🎉
      </h1>
      <p className="text-gray-400 text-center mb-8 max-w-md">
        Your payment was successful. Enjoy unlimited access to premium content.
      </p>

      {/* Subscription Details Card */}
      <Card className="max-w-md w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Subscription Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-400">Plan</span>
            <span className="font-semibold capitalize">
              {subscription?.plan || "Premium"} Plan
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-400">Status</span>
            <span className="flex items-center gap-2 text-green-500 font-medium">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Active
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-400">Start Date</span>
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              {subscription?.startDate
                ? formatDate(subscription.startDate)
                : "Today"}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-400">Valid Until</span>
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              {subscription?.endDate ? formatDate(subscription.endDate) : "N/A"}
            </span>
          </div>

          {paymentId && (
            <div className="mt-4 p-3 bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500">Payment ID</p>
              <p className="text-sm font-mono text-gray-300 truncate">
                {paymentId}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-md">
        <Link href="/vs+" className="flex-1">
          <Button className="w-full bg-pink-600 hover:bg-pink-700 h-12">
            Start Watching
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <Link href="/" className="flex-1">
          <Button variant="outline" className="w-full h-12">
            Browse Content
          </Button>
        </Link>
      </div>

      {/* Info Text */}
      <p className="text-sm text-gray-500 mt-6 text-center max-w-md">
        A confirmation email has been sent to your registered email address. You
        can manage your subscription from your profile.
      </p>
    </div>
  );
}

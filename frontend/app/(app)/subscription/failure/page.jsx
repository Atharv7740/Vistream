"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  XCircle,
  RefreshCw,
  HelpCircle,
  ArrowLeft,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PaymentFailurePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get("order_id");
  const errorCode = searchParams.get("error_code");
  const errorDescription = searchParams.get("error_description");

  const getErrorMessage = () => {
    if (errorDescription) return decodeURIComponent(errorDescription);

    switch (errorCode) {
      case "BAD_REQUEST_ERROR":
        return "There was an issue with your payment request.";
      case "GATEWAY_ERROR":
        return "Payment gateway encountered an error. Please try again.";
      case "SERVER_ERROR":
        return "Our servers are currently busy. Please try again later.";
      case "TIMEOUT":
        return "Payment request timed out. Please try again.";
      default:
        return "Your payment could not be processed. Please try again.";
    }
  };

  const handleRetry = () => {
    router.push("/subscription");
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      {/* Failure Icon */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl" />
        <XCircle className="h-24 w-24 text-red-500 relative z-10" />
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">
        Payment Failed
      </h1>
      <p className="text-gray-400 text-center mb-8 max-w-md">
        {getErrorMessage()}
      </p>

      {/* What Happened Card */}
      <Card className="max-w-md w-full bg-gray-900 border-gray-800 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <HelpCircle className="h-5 w-5 text-gray-400" />
            What might have happened?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-500 mt-2 flex-shrink-0" />
              <span>Insufficient funds in your account</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-500 mt-2 flex-shrink-0" />
              <span>Card was declined by your bank</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-500 mt-2 flex-shrink-0" />
              <span>Network connectivity issues during payment</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-500 mt-2 flex-shrink-0" />
              <span>Transaction limit exceeded</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Order ID if available */}
      {orderId && (
        <div className="mb-6 p-4 bg-gray-800/50 rounded-lg max-w-md w-full">
          <p className="text-xs text-gray-500 mb-1">Reference ID</p>
          <p className="text-sm font-mono text-gray-300 truncate">{orderId}</p>
          <p className="text-xs text-gray-500 mt-2">
            Save this ID if you need to contact support
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 w-full max-w-md">
        <Button
          onClick={handleRetry}
          className="w-full bg-pink-600 hover:bg-pink-700 h-12"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>

        <div className="grid grid-cols-2 gap-4">
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full h-12">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </Link>
          <a
            href="mailto:support@vistream.com?subject=Payment%20Failed&body=Order%20ID:%20${orderId}"
            className="w-full"
          >
            <Button variant="outline" className="w-full h-12">
              <MessageCircle className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
          </a>
        </div>
      </div>

      {/* Support Info */}
      <Card className="max-w-md w-full mt-8 bg-blue-950/30 border-blue-900/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <MessageCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-400 mb-1">Need Help?</p>
              <p className="text-sm text-gray-400">
                If money was deducted from your account, it will be refunded
                within 5-7 business days. Contact us at{" "}
                <a
                  href="mailto:support@vistream.com"
                  className="text-blue-400 hover:underline"
                >
                  support@vistream.com
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Crown,
  Calendar,
  CreditCard,
  User,
  Mail,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { api, ENDPOINT } from "@/lib/api.client";
import { updateUserPremium } from "@/redux/userSlice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [error, setError] = useState(null);

  const userData = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!userData.isLoggedIn) {
      router.push("/login");
      return;
    }

    fetchSubscriptionData();
  }, [userData.isLoggedIn]);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(ENDPOINT.mySubscription);
      setSubscriptionData(res.data);

      // Sync premium status with Redux
      if (res.data.user?.isPremium !== userData.user?.isPremium) {
        dispatch(updateUserPremium(res.data.user?.isPremium || false));
      }
    } catch (err) {
      console.error("Failed to fetch subscription:", err);
      setError("Failed to load subscription data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Active
          </Badge>
        );
      case "expired":
        return (
          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
            <Clock className="h-3 w-3 mr-1" /> Expired
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
            <XCircle className="h-3 w-3 mr-1" /> Cancelled
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <XCircle className="h-3 w-3 mr-1" /> Failed
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <Clock className="h-3 w-3 mr-1" /> {status}
          </Badge>
        );
    }
  };

  if (!userData.isLoggedIn) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  const { user, subscription, paymentHistory } = subscriptionData || {};

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-4xl font-bold">
          {userData.user?.name?.charAt(0).toUpperCase() || "U"}
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold capitalize">
            {userData.user?.name || "User"}
          </h1>
          <p className="text-gray-400 flex items-center gap-2 justify-center md:justify-start mt-1">
            <Mail className="h-4 w-4" />
            {userData.user?.email}
          </p>
          {user?.isPremium && (
            <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
              <Crown className="h-5 w-5 text-yellow-500" />
              <span className="text-yellow-500 font-medium">
                Premium Member
              </span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <Card className="bg-red-950/30 border-red-900/50">
          <CardContent className="p-4 flex items-center justify-between">
            <p className="text-red-400">{error}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={fetchSubscriptionData}
              className="border-red-500/30"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Current Subscription Card */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Subscription Status
          </CardTitle>
          <CardDescription>
            {subscription
              ? "Your current plan details"
              : "You don't have an active subscription"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="space-y-4">
              {/* Plan Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Plan</p>
                  <p className="font-semibold capitalize">
                    {subscription.plan}
                  </p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  {getStatusBadge(subscription.status)}
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Valid Until</p>
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {formatDate(subscription.endDate)}
                  </p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Days Remaining</p>
                  <p className="font-semibold text-lg">
                    {subscription.daysRemaining}
                    <span className="text-sm text-gray-400 ml-1">days</span>
                  </p>
                </div>
              </div>

              {/* Expiring Soon Warning */}
              {subscription.isExpiringSoon && (
                <div className="flex items-center gap-3 bg-yellow-950/30 border border-yellow-900/50 rounded-lg p-4">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-yellow-400">
                      Subscription Expiring Soon
                    </p>
                    <p className="text-sm text-gray-400">
                      Renew now to continue enjoying premium content without
                      interruption.
                    </p>
                  </div>
                  <Link href="/subscription" className="ml-auto">
                    <Button
                      size="sm"
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      Renew
                    </Button>
                  </Link>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex gap-3 pt-4">
                <Link href="/vs+">
                  <Button className="bg-pink-600 hover:bg-pink-700">
                    Watch Premium Content
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* No Active Subscription */
            <div className="text-center py-8">
              <Crown className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No Active Subscription
              </h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Upgrade to Premium for ad-free streaming, exclusive content, and
                downloads.
              </p>
              <Link href="/subscription">
                <Button className="bg-pink-600 hover:bg-pink-700">
                  <Crown className="h-4 w-4 mr-2" />
                  Get Premium
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-gray-400" />
            Payment History
          </CardTitle>
          <CardDescription>
            Your past transactions and subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paymentHistory && paymentHistory.length > 0 ? (
            <div className="space-y-3">
              {paymentHistory.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium capitalize">
                        {payment.plan} Plan
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(payment.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">₹{payment.amount}</p>
                      {getStatusBadge(payment.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-600" />
              <p>No payment history yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-800">
            <Link
              href="/subscription"
              className="flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Crown className="h-5 w-5 text-yellow-500" />
                <span>Manage Subscription</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-500" />
            </Link>
            <Link
              href="/watchlist"
              className="flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-blue-500" />
                <span>My Watchlist</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-500" />
            </Link>
            <a
              href="mailto:support@vistream.com"
              className="flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-green-500" />
                <span>Contact Support</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-500" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

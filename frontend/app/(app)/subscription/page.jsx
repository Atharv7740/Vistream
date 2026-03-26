"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import SpecialOfferCard from "@/components/atom/SpecialOfferCard";
import { toast } from "sonner";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { api, ENDPOINT } from "@/lib/api.client";
import { syncSubscriptionStatus } from "@/redux/userSlice";
import { useRazorpay } from "react-razorpay";
import { LucideLoader2, CheckCircle2 } from "lucide-react";

function Subscription() {
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const userData = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const {
    Razorpay,
    isLoading: razorpayLoading,
    error: razorpayError,
  } = useRazorpay();

  // Store order ID for recovery on page reload
  const [currentOrderId, setCurrentOrderId] = useState(null);

  // Fetch subscription plans from backend
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setPlansLoading(true);
        const res = await api.get(ENDPOINT.plans);

        if (res.data.status === "success") {
          // Transform backend data to frontend format
          const transformedPlans = res.data.plans.map((plan) => ({
            id: plan.id,
            title: `Premium ${plan.name.charAt(0).toUpperCase() + plan.name.slice(1)}`,
            price: plan.price.toString(),
            originalPrice: (plan.price * 2).toString(),
            discountLabel: "50% OFF",
            duration: plan.duration === 30 ? "1 Month" : "6 Months",
            features: [
              "Ad-Free (except sports & live)",
              "Includes all Premium content",
              "Any 1 device at a time (up to Asli 4K quality)",
              "Download and watch anytime",
              ...(plan.duration > 30 ? ["Extended access - save more!"] : []),
            ],
          }));

          setPlans(transformedPlans);
        }
      } catch (err) {
        console.error("Error fetching plans:", err);
        toast.error("Could not load subscription plans. Please refresh.");
      } finally {
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // Check for existing premium subscription on mount
  useEffect(() => {
    const checkExistingSubscription = async () => {
      if (!userData.isLoggedIn) return;

      try {
        const res = await api.get(ENDPOINT.subscriptionStatus);
        if (res.data.isPremium) {
          toast.info("You already have an active subscription!");
          router.push("/profile");
        }
      } catch (err) {
        // Silently fail - user can still see plans
      }
    };

    checkExistingSubscription();
  }, [userData.isLoggedIn]);

  // Handle payment window close / page reload recovery
  useEffect(() => {
    const pendingOrderId = sessionStorage.getItem("vistream_pending_order");
    if (pendingOrderId && userData.isLoggedIn) {
      // Check if this order was completed via webhook
      const verifyPendingOrder = async () => {
        try {
          const res = await api.get(ENDPOINT.verifyOrder(pendingOrderId));
          if (res.data.paymentStatus === "completed") {
            sessionStorage.removeItem("vistream_pending_order");
            dispatch(updateUserPremium(true));
            toast.success("Your subscription is active!");
            router.push(`/subscription/success?order_id=${pendingOrderId}`);
          } else if (res.data.paymentStatus === "failed") {
            sessionStorage.removeItem("vistream_pending_order");
            router.push(`/subscription/failure?order_id=${pendingOrderId}`);
          }
          // If still pending, let user retry
        } catch (err) {
          // Order not found or error - clear storage
          sessionStorage.removeItem("vistream_pending_order");
        }
      };

      verifyPendingOrder();
    }
  }, [userData.isLoggedIn]);

  const handlePaymentClick = async () => {
    if (!selectedPlan) {
      toast.error("Select a plan to continue");
      return;
    }

    if (!userData.isLoggedIn) {
      router.push("/login");
      return;
    }

    // Check if Razorpay is loaded
    if (razorpayLoading) {
      toast.error("Payment system is loading. Please wait...");
      return;
    }

    if (razorpayError) {
      toast.error("Payment system failed to load. Please refresh the page.");
      console.error("Razorpay error:", razorpayError);
      return;
    }

    if (!Razorpay) {
      toast.error("Payment system not available. Please refresh the page.");
      return;
    }

    try {
      setLoading(true);

      const orderRes = await api.post(ENDPOINT.payment, { plan: selectedPlan });
      console.log("Order response:", orderRes.data);

      if (orderRes.data.status !== "success") {
        toast.error(orderRes.data.message || "Failed to create order");
        setLoading(false);
        return;
      }

      if (!orderRes.data.keyId) {
        toast.error("Payment configuration error. Please try again.");
        console.error("Missing keyId in response:", orderRes.data);
        setLoading(false);
        return;
      }

      const orderId = orderRes.data.orderId;
      setCurrentOrderId(orderId);

      // Store order ID for recovery on page reload
      sessionStorage.setItem("vistream_pending_order", orderId);

      const options = {
        key: orderRes.data.keyId,
        amount: orderRes.data.amount,
        currency: "INR",
        name: "ViStream",
        description: `${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Subscription`,
        order_id: orderId,
        handler: async function (response) {
          try {
            const verifyRes = await api.post(ENDPOINT.verifyPayment, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            // Clear pending order
            sessionStorage.removeItem("vistream_pending_order");

            if (verifyRes.data.status === "success") {
              // Sync full subscription data to Redux
              dispatch(
                syncSubscriptionStatus({
                  isPremium: true,
                  subscription: verifyRes.data.subscription,
                }),
              );

              toast.success("Welcome to ViStream Premium!");
              // Redirect to success page with payment details
              router.push(
                `/subscription/success?order_id=${response.razorpay_order_id}&payment_id=${response.razorpay_payment_id}`,
              );
            } else {
              toast.error("Payment verification failed");
              router.push(
                `/subscription/failure?order_id=${response.razorpay_order_id}`,
              );
            }
          } catch (err) {
            toast.error("Payment verification failed");
            router.push(
              `/subscription/failure?order_id=${response.razorpay_order_id}`,
            );
          }
        },
        prefill: {
          email: userData.user?.email,
          name: userData.user?.name,
        },
        theme: {
          color: "#db2777",
        },
        modal: {
          ondismiss: function () {
            // User closed payment modal without completing
            toast.info("Payment cancelled. You can try again anytime.");
            setLoading(false);
          },
        },
      };

      const rzp = new Razorpay(options);
      rzp.on("payment.failed", function (response) {
        sessionStorage.removeItem("vistream_pending_order");
        toast.error(response.error.description || "Payment failed");
        router.push(
          `/subscription/failure?order_id=${orderId}&error_code=${response.error.code}&error_description=${encodeURIComponent(response.error.description || "")}`,
        );
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Image
        src="/image/premium.png"
        alt="Background Image"
        fill={true}
        quality={100}
        className="-z-50 hidden md:block object-fit"
      />

      <div className="mx-auto p-4 md:pt-8 pt-4">
        <div className="flex items-center justify-between md:mb-8">
          <Link
            href="/"
            className="hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
          >
            ←
          </Link>
        </div>

        <Image
          src="/motu-patlu.png"
          alt="Background Image"
          className="w-full md:hidden rounded-lg mb-4 h-[100px] object-fit"
          width={354}
          height={60}
        />

        <div className="md:mx-16">
          <h1 className="md:text-4xl text-2xl leading-none font-black md:text-12 mb-4 text-nowrap">
            ViStream Premium
          </h1>
          <p className="text-lg mb-8 w-[70%] text-wrap hidden md:block">
            Entertainment Redefined - The best of Hollywood, Before TV
            premieres, Blockbuster movies, Exclusive series, India{`'`}s biggest
            Kids & Family hub + 365 days of reality!
          </p>

          {/* Loading State */}
          {plansLoading ? (
            <div className="flex items-center justify-center py-20">
              <LucideLoader2 className="animate-spin w-10 h-10 text-pink-500" />
              <span className="ml-3 text-lg">Loading plans...</span>
            </div>
          ) : plans.length === 0 ? (
            /* Empty State */
            <div className="text-center py-20">
              <p className="text-gray-400 mb-4">
                No subscription plans available at the moment.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="text-pink-500 hover:underline"
              >
                Refresh page
              </button>
            </div>
          ) : (
            <>
              {/* Plans Grid */}
              <div className="flex flex-col md:flex-row w-full md:gap-8 gap-2">
                {plans.map((offer) => (
                  <SpecialOfferCard
                    key={offer.id}
                    title={offer.title}
                    features={offer.features}
                    price={offer.price}
                    originalPrice={offer.originalPrice}
                    discountLabel={offer.discountLabel}
                    duration={offer.duration}
                    isActive={selectedPlan === offer.id}
                    onClick={() => setSelectedPlan(offer.id)}
                  />
                ))}
              </div>

              {/* Payment Summary */}
              {selectedPlan && (
                <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700 max-w-md">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" />
                    Payment Summary
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Selected Plan:</span>
                      <span className="font-medium">
                        {plans.find((p) => p.id === selectedPlan)?.title}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Duration:</span>
                      <span className="font-medium">
                        {plans.find((p) => p.id === selectedPlan)?.duration}
                      </span>
                    </div>
                    <div className="border-t border-gray-700 my-2 pt-2 flex justify-between text-lg">
                      <span className="font-semibold">Total Amount:</span>
                      <span className="font-bold text-pink-500">
                        ₹{plans.find((p) => p.id === selectedPlan)?.price}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Continue Button */}
              <button
                className="bg-pink-600 p-3 md:mt-6 mt-4 item-start flex font-medium rounded-lg ml-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-700 transition-colors"
                onClick={handlePaymentClick}
                disabled={loading || razorpayLoading || !selectedPlan}
              >
                {razorpayLoading
                  ? "Loading Payment..."
                  : loading
                    ? "Processing..."
                    : selectedPlan
                      ? `Continue & Pay ₹${plans.find((p) => p.id === selectedPlan)?.price}`
                      : "Select a Plan to Continue"}
                {loading && (
                  <LucideLoader2 className="animate-spin ml-2 w-4 h-4" />
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Subscription;

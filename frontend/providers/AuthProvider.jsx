"use client";
import { api, ENDPOINT } from "@/lib/api.client";
import { setLoginDetails } from "@/redux/userSlice";
import { Loader2Icon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(ENDPOINT.user);
        if (res.data.status === "success") {
          dispatch(setLoginDetails(res.data.user));
        }
      } catch (err) {
        // Axios interceptor handles token refresh automatically
        console.error("Failed to fetch user", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [dispatch]);

  if (loading)
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <Loader2Icon className="w-[100px] h-[100px] animate-spin text-white" />
      </div>
    );
  return <>{children}</>;
};

export default AuthProvider;

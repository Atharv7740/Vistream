"use client";

import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const userData = useSelector((state) => state.user);

  useEffect(() => {
    if (!userData?.user || userData?.user?.role !== "admin") {
      router.push("/");
    }
  }, [userData, router]);

  if (!userData?.user || userData?.user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#c1a362]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="bg-[#1a1a1a] border-b border-gray-800 p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-[#c1a362]">Admin Panel</h1>
          <p className="text-gray-400">Manage your Vistream platform</p>
        </div>
      </div>
      <div className="container mx-auto p-4">
        {children}
      </div>
    </div>
  );
}

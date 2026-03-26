"use client";

import { useEffect, useState } from "react";
import { api, ENDPOINT } from "@/lib/api.client";
import { Users, Crown, DollarSign, BarChart3, Video } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get(ENDPOINT.adminDashboard);
        setStats(response.data.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c1a362]"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      title: "Premium Users",
      value: stats?.premiumUsers || 0,
      icon: Crown,
      color: "text-[#c1a362]",
      bg: "bg-[#c1a362]/10",
    },
    {
      title: "Free Users",
      value: stats?.freeUsers || 0,
      icon: Users,
      color: "text-green-400",
      bg: "bg-green-400/10",
    },
    {
      title: "Total Revenue",
      value: `₹${stats?.revenue || 0}`,
      icon: DollarSign,
      color: "text-green-400",
      bg: "bg-green-400/10",
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm">{stat.title}</span>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Quick Actions</h3>
          </div>
          <div className="space-y-3">
            <Link
              href="/admin/videos"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#252525] hover:bg-[#2a2a2a] transition-colors"
            >
              <Video className="h-5 w-5 text-[#c1a362]" />
              <span>Manage Videos</span>
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#252525] hover:bg-[#2a2a2a] transition-colors"
            >
              <Users className="h-5 w-5 text-[#c1a362]" />
              <span>Manage Users</span>
            </Link>
          </div>
        </div>

        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
          <h3 className="text-lg font-semibold mb-4">Recent Users</h3>
          <div className="space-y-3">
            {stats?.recentUsers?.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between p-3 rounded-lg bg-[#252525]"
              >
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-400">{user.email}</div>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    user.role === "admin"
                      ? "bg-[#c1a362]/20 text-[#c1a362]"
                      : "bg-gray-700 text-gray-300"
                  }`}
                >
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

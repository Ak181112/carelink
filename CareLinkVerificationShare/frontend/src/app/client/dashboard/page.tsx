"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { parentAPI, caretakerAPI, notificationAPI, bookingAPI } from "@/services/api";
import { useApiData } from "@/lib/useApiData";
import { Booking } from "@/types";

export default function ClientDashboardPage() {
  const { user } = useAuth();

  const fetchSummary = useCallback(
    () =>
      Promise.all([
        parentAPI.getAll().catch(() => null),
        caretakerAPI.getApproved().catch(() => null),
        notificationAPI.getAll().catch(() => null),
        bookingAPI.getMine().catch(() => null),
      ]),
    [],
  );

  const { data, loading } = useApiData(fetchSummary);
  const [parents, caretakers, notifications, bookings] = data ?? [];

  const bookingList: Booking[] = bookings?.bookings ?? [];
  const activeBookings = bookingList.filter((b) =>
    ["pending", "accepted", "in_progress"].includes(b.status),
  ).length;

  const stats = [
    { label: "Parent Profiles", value: parents?.profiles?.length ?? 0, icon: "👴", href: "/client/parents", color: "bg-blue-50 text-blue-600" },
    { label: "Available Caretakers", value: caretakers?.caretakers?.length ?? 0, icon: "🩺", href: "/client/caretakers", color: "bg-green-50 text-green-600" },
    { label: "Active Bookings", value: activeBookings, icon: "📅", href: "/client/bookings", color: "bg-purple-50 text-purple-600" },
    { label: "Unread Notifications", value: notifications?.unreadCount ?? 0, icon: "🔔", href: "/client/notifications", color: "bg-yellow-50 text-yellow-600" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#091E42]">Welcome back, {user?.name?.split(" ")[0]}! 👋</h1>
        <p className="mt-2 text-[#42526E]">Manage your family&apos;s care needs from your dashboard.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}
            className="bg-white rounded-2xl p-6 border border-[#DFE1E6] hover:shadow-md transition group">
            <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${stat.color} text-2xl mb-4`}>
              {stat.icon}
            </div>
            <p className="text-3xl font-bold text-[#091E42]">{loading ? "—" : stat.value}</p>
            <p className="mt-1 text-sm text-[#42526E]">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-[#DFE1E6] p-6 mb-6">
        <h2 className="text-xl font-bold text-[#091E42] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Add Parent Profile", href: "/client/parents?new=true", icon: "➕", desc: "Create a profile for your parent" },
            { label: "Find Caretakers", href: "/client/caretakers", icon: "🔍", desc: "Browse approved caretakers" },
            { label: "My Profile", href: "/client/profile", icon: "✏️", desc: "Update your information" },
            { label: "Notifications", href: "/client/notifications", icon: "🔔", desc: "View your notifications" },
          ].map((action) => (
            <Link key={action.label} href={action.href}
              className="rounded-xl border border-[#DFE1E6] p-4 hover:border-[#0052CC] hover:bg-[#F4F8FF] transition">
              <span className="text-2xl">{action.icon}</span>
              <p className="mt-2 font-semibold text-[#091E42] text-sm">{action.label}</p>
              <p className="text-xs text-[#42526E] mt-1">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Info Banner */}
      <div className="rounded-2xl bg-[#EEF4FF] border border-[#C7D9FF] p-6">
        <div className="flex items-start gap-4">
          <span className="text-3xl">💙</span>
          <div>
            <h3 className="font-semibold text-[#091E42]">Find the right caretaker for your loved ones</h3>
            <p className="mt-1 text-sm text-[#42526E]">
              Browse our verified caretakers in Kurunegala district. All caretakers are screened and approved by our admin team.
            </p>
            <Link href="/client/caretakers" className="mt-3 inline-block text-sm font-semibold text-[#0052CC] hover:underline">
              Browse Caretakers →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

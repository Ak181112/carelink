"use client";

import { useCallback } from "react";
import Link from "next/link";
import { adminAPI } from "@/services/api";
import { useApiData } from "@/lib/useApiData";
import { AdminApplication } from "@/types";

interface Stats {
  totalUsers: number;
  totalCaretakers: number;
  totalClients: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  addressMismatchCount?: number;
  totalBookings?: number;
  pendingBookings?: number;
  activeBookings?: number;
  completedBookings?: number;
  emergencyBookings?: number;
  totalRevenue?: number;
}

export default function AdminDashboardPage() {
  const fetchDashboard = useCallback(() => adminAPI.getDashboard(), []);
  const { data, loading } = useApiData(fetchDashboard);

  const stats: Stats | null = data?.stats ?? null;
  const recentApps: AdminApplication[] = data?.recentApplications ?? [];

  const statCards = [
    {
      label: "Total Users",
      value: stats?.totalUsers,
      icon: "👥",
      color: "bg-blue-50 text-blue-600",
      href: "/admin/users",
    },
    {
      label: "Total Caretakers",
      value: stats?.totalCaretakers,
      icon: "🩺",
      color: "bg-green-50 text-green-600",
      href: "/admin/users?role=caretaker",
    },
    {
      label: "Pending Applications",
      value: stats?.pendingApplications,
      icon: "⏳",
      color: "bg-yellow-50 text-yellow-700",
      href: "/admin/applications?status=pending",
    },
    {
      label: "Address Mismatch",
      value: stats?.addressMismatchCount ?? 0,
      icon: "⚠️",
      color: "bg-red-50 text-red-600",
      href: "/admin/applications",
    },
    {
      label: "Total Bookings",
      value: stats?.totalBookings ?? 0,
      icon: "📅",
      color: "bg-purple-50 text-purple-600",
      href: "/admin/bookings",
    },
    {
      label: "Active Bookings",
      value: stats?.activeBookings ?? 0,
      icon: "🚗",
      color: "bg-indigo-50 text-indigo-600",
      href: "/admin/bookings?status=accepted",
    },
    {
      label: "Emergencies",
      value: stats?.emergencyBookings ?? 0,
      icon: "🚨",
      color: "bg-red-50 text-red-600",
      href: "/admin/bookings",
    },
    {
      label: "Collected Revenue",
      value: `LKR ${(stats?.totalRevenue ?? 0).toLocaleString("en-LK")}`,
      icon: "💰",
      color: "bg-emerald-50 text-emerald-600",
      href: "/admin/payments",
    },
  ];

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-600",
    };

    return (
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${
          map[status] || "bg-gray-100 text-gray-600"
        }`}
      >
        {status}
      </span>
    );
  };

  const addressBadge = (matched?: boolean) => {
    if (matched === true) {
      return (
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
          Address Same
        </span>
      );
    }

    if (matched === false) {
      return (
        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
          Address Not Same
        </span>
      );
    }

    return (
      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
        Not Checked
      </span>
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#091E42]">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-[#42526E]">
          CareLink+ platform overview and caretaker verification summary
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6">
        {statCards.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-2xl border border-[#DFE1E6] bg-white p-5 transition hover:shadow-md"
          >
            <div
              className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl ${s.color} text-xl`}
            >
              {s.icon}
            </div>

            <p className="text-2xl font-bold text-[#091E42]">
              {loading ? "—" : s.value ?? 0}
            </p>

            <p className="mt-1 text-xs text-[#42526E]">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#DFE1E6] bg-white p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#091E42]">
              Recent Applications
            </h2>

            <Link
              href="/admin/applications"
              className="text-sm text-[#0052CC] hover:underline"
            >
              View all
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-[#42526E]">Loading...</div>
          ) : recentApps.length === 0 ? (
            <div className="py-8 text-center text-[#42526E]">
              No applications yet
            </div>
          ) : (
            <div className="space-y-3">
              {recentApps.map((app) => (
                <div
                  key={app._id}
                  className="border-b border-[#DFE1E6] py-3 last:border-0"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-[#091E42]">
                        {app.caretakerId?.name || "N/A"}
                      </p>

                      <p className="text-xs text-[#6B7280]">
                        {app.submittedAt || app.createdAt
                          ? new Date(
                              app.submittedAt || app.createdAt!
                            ).toLocaleDateString()
                          : "—"}
                      </p>
                    </div>

                    {statusBadge(app.status || app.verificationStatus)}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {addressBadge(app.addressMatched)}

                    {app.nicNumber && (
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                        NIC: {app.nicNumber}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[#DFE1E6] bg-white p-6">
          <h2 className="mb-5 text-lg font-bold text-[#091E42]">
            Quick Actions
          </h2>

          <div className="space-y-3">
            {[
              {
                label: "Review Pending Applications",
                href: "/admin/applications?status=pending",
                icon: "📋",
                urgent: (stats?.pendingApplications || 0) > 0,
              },
              {
                label: "Review Address Mismatches",
                href: "/admin/applications",
                icon: "⚠️",
                urgent: (stats?.addressMismatchCount || 0) > 0,
              },
              {
                label: "Manage Bookings",
                href: "/admin/bookings",
                icon: "📅",
                urgent: false,
              },
              {
                label: "View Payments",
                href: "/admin/payments",
                icon: "💳",
                urgent: false,
              },
              {
                label: "Contact Messages",
                href: "/admin/contact-messages",
                icon: "✉️",
                urgent: false,
              },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-between rounded-xl border border-[#DFE1E6] px-4 py-3 transition hover:border-[#0052CC] hover:bg-[#F4F8FF]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-medium text-[#091E42]">
                    {item.label}
                  </span>
                </div>

                {item.urgent && (
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { adminAPI } from "@/services/api";

interface Stats {
  totalUsers: number;
  totalCaretakers: number;
  totalClients: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  totalBookings?: number;
  totalRevenue?: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard()
      .then((d) => { setStats(d.stats); setRecentApps(d.recentApplications || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers, icon: "👥", color: "bg-blue-50 text-blue-600", href: "/admin/users" },
    { label: "Total Caretakers", value: stats?.totalCaretakers, icon: "🩺", color: "bg-green-50 text-green-600", href: "/admin/users?role=caretaker" },
    { label: "Pending Applications", value: stats?.pendingApplications, icon: "⏳", color: "bg-yellow-50 text-yellow-700", href: "/admin/applications?status=pending" },
    { label: "Total Bookings", value: stats?.totalBookings ?? 0, icon: "📅", color: "bg-purple-50 text-purple-600", href: "/admin/bookings" },
    { label: "Total Revenue", value: `LKR ${(stats?.totalRevenue ?? 0).toLocaleString()}`, icon: "💰", color: "bg-emerald-50 text-emerald-600", href: "/admin/payments" },
  ];

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-600",
    };
    return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${map[status] || "bg-gray-100 text-gray-600"}`}>{status}</span>;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#091E42]">Admin Dashboard</h1>
        <p className="mt-1 text-[#42526E]">CareLink+ platform overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
        {statCards.map((s) => (
          <Link key={s.label} href={s.href}
            className="bg-white rounded-2xl p-5 border border-[#DFE1E6] hover:shadow-md transition">
            <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${s.color} text-xl mb-3`}>
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-[#091E42]">{loading ? "—" : s.value ?? 0}</p>
            <p className="mt-1 text-xs text-[#42526E]">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-white rounded-2xl border border-[#DFE1E6] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-[#091E42]">Recent Applications</h2>
            <Link href="/admin/applications" className="text-sm text-[#0052CC] hover:underline">View all</Link>
          </div>
          {loading ? <div className="text-center py-8 text-[#42526E]">Loading...</div> :
            recentApps.length === 0 ? <div className="text-center py-8 text-[#42526E]">No applications yet</div> :
            <div className="space-y-3">
              {recentApps.map((app: any) => (
                <div key={app._id} className="flex items-center justify-between py-3 border-b border-[#DFE1E6] last:border-0">
                  <div>
                    <p className="font-medium text-[#091E42] text-sm">{app.caretakerId?.name || "N/A"}</p>
                    <p className="text-xs text-[#6B7280]">{new Date(app.submittedAt).toLocaleDateString()}</p>
                  </div>
                  {statusBadge(app.status)}
                </div>
              ))}
            </div>}
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl border border-[#DFE1E6] p-6">
          <h2 className="text-lg font-bold text-[#091E42] mb-5">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { label: "Review Pending Applications", href: "/admin/applications?status=pending", icon: "📋", urgent: (stats?.pendingApplications || 0) > 0 },
              { label: "Manage Bookings", href: "/admin/bookings", icon: "📅", urgent: false },
              { label: "View Payments", href: "/admin/payments", icon: "💳", urgent: false },
              { label: "Contact Messages", href: "/admin/contact-messages", icon: "✉️", urgent: false },
            ].map((item) => (
              <Link key={item.label} href={item.href}
                className="flex items-center justify-between rounded-xl border border-[#DFE1E6] px-4 py-3 hover:border-[#0052CC] hover:bg-[#F4F8FF] transition">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-medium text-[#091E42]">{item.label}</span>
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

"use client";

import { useState, useEffect } from "react";
import { adminAPI } from "@/services/api";

const typeIcon: Record<string, string> = {
  application_submitted: "📋", application_approved: "✅",
  application_rejected: "❌", profile_updated: "👤", general: "🔔",
};

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getNotifications()
      .then((d) => setNotifications(d.notifications || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#091E42]">System Notifications</h1>
        <p className="mt-1 text-[#42526E]">View all platform notifications</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-[#42526E]">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#DFE1E6] p-16 text-center">
          <span className="text-6xl">🔔</span>
          <h3 className="mt-4 text-xl font-bold text-[#091E42]">No notifications</h3>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#DFE1E6] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFC] border-b border-[#DFE1E6]">
                <tr>
                  {["Type", "User", "Title", "Message", "Time"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-[#42526E] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE1E6]">
                {notifications.map((n: any) => (
                  <tr key={n._id} className="hover:bg-[#F8FAFC]">
                    <td className="px-5 py-4 text-lg">{typeIcon[n.type] || "🔔"}</td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-[#091E42]">{n.userId?.name || "N/A"}</div>
                      <div className="text-xs text-[#42526E]">{n.userId?.role}</div>
                    </td>
                    <td className="px-5 py-4 font-medium text-[#091E42]">{n.title}</td>
                    <td className="px-5 py-4 text-[#42526E] max-w-xs truncate">{n.message}</td>
                    <td className="px-5 py-4 text-xs text-[#6B7280] whitespace-nowrap">{new Date(n.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

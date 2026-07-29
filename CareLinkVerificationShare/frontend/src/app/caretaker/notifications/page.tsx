"use client";

import { useCallback } from "react";
import { notificationAPI } from "@/services/api";
import { useApiData } from "@/lib/useApiData";
import { Notification } from "@/types";

const typeIcon: Record<string, string> = {
  application_submitted: "📋", application_approved: "✅",
  application_rejected: "❌", profile_updated: "👤",
  review_received: "⭐", general: "🔔",
};

export default function CaretakerNotificationsPage() {
  const fetchNotifications = useCallback(() => notificationAPI.getAll(), []);
  const { data, loading, mutate } = useApiData(fetchNotifications);
  const notifications: Notification[] = data?.notifications ?? [];

  const updateList = (update: (list: Notification[]) => Notification[]) =>
    mutate((current) =>
      current
        ? { ...current, notifications: update(current.notifications ?? []) }
        : current,
    );

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#091E42]">Notifications</h1>
          <p className="mt-1 text-[#42526E]">{unread > 0 ? `${unread} unread` : "All caught up"}</p>
        </div>
        {unread > 0 && (
          <button onClick={async () => { await notificationAPI.markAllAsRead(); updateList((list) => list.map((n) => ({ ...n, isRead: true }))); }}
            className="rounded-xl border border-[#DFE1E6] px-5 py-2.5 text-sm font-semibold text-[#42526E] hover:bg-gray-50">
            Mark all read
          </button>
        )}
      </div>

      {loading ? <div className="text-center py-16 text-[#42526E]">Loading...</div> :
        notifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#DFE1E6] p-16 text-center">
            <span className="text-6xl">🔔</span>
            <h3 className="mt-4 text-xl font-bold text-[#091E42]">No notifications</h3>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n._id}
                className={`bg-white rounded-2xl border p-5 flex items-start gap-4 ${n.isRead ? "border-[#DFE1E6]" : "border-[#0052CC] bg-[#F4F8FF]"}`}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF4FF] text-xl">
                  {typeIcon[n.type] || "🔔"}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold text-[#091E42] ${!n.isRead ? "font-bold" : ""}`}>{n.title}</h3>
                  <p className="mt-1 text-sm text-[#42526E]">{n.message}</p>
                  <p className="mt-2 text-xs text-[#6B7280]">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.isRead && (
                  <button onClick={async () => { await notificationAPI.markAsRead(n._id); updateList((list) => list.map((x) => x._id === n._id ? { ...x, isRead: true } : x)); }}
                    className="shrink-0 rounded-lg border border-[#DFE1E6] px-3 py-1 text-xs text-[#42526E] hover:bg-gray-50">
                    Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

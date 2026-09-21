"use client";

import { useState, useEffect } from "react";
import { notificationAPI } from "@/services/api";
import { Notification } from "@/types";
import {
  Bell,
  CheckCircle,
  FileText,
  User,
  XCircle,
  Filter,
} from "lucide-react";

const typeIcon = {
  application_submitted: (
    <FileText className="h-6 w-6 text-[#003898]" />
  ),
  application_approved: (
    <CheckCircle className="h-6 w-6 text-green-600" />
  ),
  application_rejected: (
    <XCircle className="h-6 w-6 text-red-600" />
  ),
  profile_updated: (
    <User className="h-6 w-6 text-[#003898]" />
  ),
  general: (
    <Bell className="h-6 w-6 text-[#003898]" />
  ),
};

export default function ClientNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // NEW: Filter state
  const [filter, setFilter] = useState("all");

  const load = async () => {
    try {
      const data = await notificationAPI.getAll();
      setNotifications(data.notifications || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        )
      );
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          isRead: true,
        }))
      );
    } catch {}
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationAPI.delete(id);
      setNotifications((prev) =>
        prev.filter((n) => n._id !== id)
      );
    } catch {}
  };

  const unread = notifications.filter((n) => !n.isRead).length;

  // NEW: Filter notifications
  const filteredNotifications = notifications.filter((n) => {
    switch (filter) {
      case "unread":
        return !n.isRead;

      case "read":
        return n.isRead;

      case "application":
        return [
          "application_submitted",
          "application_approved",
          "application_rejected",
        ].includes(n.type);

      case "profile":
        return n.type === "profile_updated";

      case "general":
        return n.type === "general";

      default:
        return true;
    }
  });

  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>

          <h1 className="text-4xl font-bold text-[#091E42]">
            Notifications
          </h1>

          <p className="text-gray-500 mt-2">
            View and manage all your notifications.
          </p>

        </div>

        {unread > 0 && (

          <button
            onClick={handleMarkAllRead}
            className="border border-[#003898] text-[#003898] rounded-xl px-6 py-3 font-semibold hover:bg-blue-50 transition-all duration-300"
          >
            Mark All as Read
          </button>

        )}

      </div>
      {loading ? (

  <div className="bg-white rounded-2xl border shadow-sm p-16 text-center">

    <div className="mx-auto h-20 w-20 rounded-2xl bg-[#F8FAFF] border border-[#E6EEFF] flex items-center justify-center">

      <Bell className="h-10 w-10 text-[#003898]" />

    </div>

    <h3 className="mt-6 text-2xl font-bold text-[#091E42]">
      Loading Notifications...
    </h3>

    <p className="mt-2 text-gray-500">
      Please wait while we fetch your notifications.
    </p>

  </div>

) : notifications.length === 0 ? (

  <div className="bg-white rounded-2xl border shadow-sm p-16 text-center">

    <div className="mx-auto h-20 w-20 rounded-2xl bg-[#F8FAFF] border border-[#E6EEFF] flex items-center justify-center">

      <Bell className="h-10 w-10 text-[#003898]" />

    </div>

    <h3 className="mt-6 text-2xl font-bold text-[#091E42]">
      No Notifications
    </h3>

    <p className="mt-2 text-gray-500">
      You're all caught up!
    </p>

  </div>

) : (

  <div className="bg-white rounded-2xl border shadow-sm p-6">

    {/* Section Header */}

    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

      <div>

        <h2 className="text-2xl font-bold text-[#091E42]">
          Recent Notifications
        </h2>

        <p className="text-gray-500 mt-1">
          Your latest CareLink+ updates.
        </p>

      </div>

      <div className="flex flex-wrap items-center gap-3">

        <span className="px-3 py-1 rounded-full bg-[#EEF4FF] text-[#003898] text-sm font-semibold">
          {filteredNotifications.length} Notifications
        </span>

        <div className="flex items-center gap-2">

          <Filter className="h-4 w-4 text-[#003898]" />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border border-[#DFE1E6] bg-white px-3 py-2 text-sm text-[#091E42] focus:border-[#003898] focus:outline-none"
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>

        </div>

      </div>

    </div>

    <div className="space-y-5">

      {filteredNotifications.length === 0 ? (

        <div className="py-12 text-center">

          <Bell className="mx-auto h-10 w-10 text-gray-300 mb-3" />

          <h3 className="text-lg font-semibold text-[#091E42]">
            No notifications found
          </h3>

          <p className="mt-2 text-gray-500">
            There are no notifications for the selected filter.
          </p>

        </div>

      ) : (

        filteredNotifications.map((n) => (

  <div
    key={n._id}
    className={`border rounded-2xl p-4 transition-all duration-300 hover:shadow-md ${
      n.isRead
        ? "border-gray-200 bg-white"
        : "border-[#0052CC] bg-[#F8FBFF]"
    }`}
  >
    <div className="flex gap-4">

      {/* Icon */}

      <div className="h-12 w-12 rounded-xl bg-[#F8FAFF] border border-[#E6EEFF] flex items-center justify-center shrink-0">
        {typeIcon[n.type as keyof typeof typeIcon] || (
          <Bell className="h-5 w-5 text-[#003898]" />
        )}
      </div>

      {/* Content */}

      <div className="flex-1 min-w-0">

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

          <div className="flex-1">

            <div className="flex items-center gap-2 flex-wrap">

              <h3
                className={`text-base text-[#091E42] ${
                  n.isRead ? "font-semibold" : "font-bold"
                }`}
              >
                {n.title}
              </h3>

              {!n.isRead && (
                <span className="px-2.5 py-1 rounded-full bg-[#EEF4FF] text-[#003898] text-xs font-semibold">
                  New
                </span>
              )}

            </div>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              {n.message}
            </p>

            <p className="mt-3 text-xs text-gray-500">
              {new Date(n.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
              {" • "}
              {new Date(n.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>

          </div>

          {/* Buttons */}

          <div className="flex flex-col gap-2 shrink-0">

            {!n.isRead && (
              <button
                onClick={() => handleMarkRead(n._id)}
                className="border border-[#003898] text-[#003898] rounded-xl px-4 py-2 text-sm font-semibold hover:bg-blue-50 transition-all duration-300"
              >
                Mark Read
              </button>
            )}

            <button
              onClick={() => handleDelete(n._id)}
              className="bg-red-600 text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-red-700 transition-all duration-300"
            >
              Delete
            </button>

          </div>

        </div>

      </div>

    </div>

  </div>

))

         )}

    </div>

  </div>

)}

</div>

  );
}
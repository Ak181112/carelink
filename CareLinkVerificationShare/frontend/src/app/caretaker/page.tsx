"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { caretakerAPI, notificationAPI } from "@/services/api";
import { CaretakerApplication, CaretakerProfile } from "@/types";
import {
  Banknote,
  Briefcase,
  CheckCircle2,
  Clock3,
  AlertCircle,
  CalendarDays,
} from "lucide-react";

const statusConfig = {
  not_applied: {
    label: "Not Applied",
    color: "bg-gray-100 text-gray-600",
    icon: "⭕",
  },
  pending: {
    label: "Pending Review",
    color: "bg-yellow-100 text-yellow-700",
    icon: "⏳",
  },
  approved: {
    label: "Approved",
    color: "bg-green-100 text-green-700",
    icon: "✅",
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-600",
    icon: "❌",
  },
};

export default function CaretakerDashboardPage() {
  const { user } = useAuth();

  const [profile, setProfile] = useState<CaretakerProfile | null>(null);
  const [application, setApplication] = useState<CaretakerApplication | null>(
    null,
  );

  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    Promise.all([
      caretakerAPI
        .getMyProfile()
        .then((d) => {
          setProfile(d.profile);
          setAvailable(d.profile?.isAvailable ?? false);
        })
        .catch(() => {}),

      caretakerAPI
        .getApplicationStatus()
        .then((d) => {
          setApplication(d.application || d.data?.application || null);
        })
        .catch(() => {}),

      notificationAPI
        .getAll()
        .then((d) => setUnread(d.unreadCount || 0))
        .catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const handleToggle = async (value: boolean) => {
    setToggling(true);

    try {
      const fd = new FormData();
      fd.append("isAvailable", String(value));

      await caretakerAPI.createOrUpdateProfile(fd, true);
      setAvailable(value);
    } catch {
      // ignore
    } finally {
      setToggling(false);
    }
  };

  const status =
    application?.status ||
    application?.verificationStatus ||
    profile?.applicationStatus ||
    "not_applied";

  const statusInfo =
    statusConfig[status as keyof typeof statusConfig] ||
    statusConfig.not_applied;

  const isApproved = status === "approved";

  const addressMatched = application?.addressMatched;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#091E42]">
          Welcome, {user?.name?.split(" ")[0]}! 👋
        </h1>
        <p className="mt-1 text-[#42526E]">
          Manage your caretaker profile and availability.
        </p>
      </div>

      <div
        className={`rounded-2xl border p-5 ${
          status === "approved"
            ? "border-green-200 bg-green-50"
            : status === "pending"
              ? "border-yellow-200 bg-yellow-50"
              : status === "rejected"
                ? "border-red-200 bg-red-50"
                : "border-gray-200 bg-gray-50"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{statusInfo.icon}</span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#42526E]">
              Application Status
            </p>
            <span
              className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-bold ${statusInfo.color}`}
            >
              {statusInfo.label}
            </span>
          </div>
        </div>

        {status === "not_applied" && (
          <p className="mt-2 text-sm text-[#42526E]">
            Complete your profile and submit an application to start receiving
            care requests.
          </p>
        )}

        {status === "rejected" && (
          <p className="mt-2 text-sm text-red-600">
            Your application was rejected. Update your profile and re-apply.
          </p>
        )}
      </div>

      {isApproved && (
        <div className="rounded-2xl border border-[#DFE1E6] bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-base font-bold text-[#091E42]">
                <CalendarDays className="h-5 w-5 text-[#0052CC]" />
                Availability Status
              </h2>
              <p className="mt-1 text-sm text-[#42526E]">
                Control whether clients can book you for hospital visits.
              </p>
            </div>

            <span
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold ${
                available
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-gray-200 bg-gray-100 text-gray-600"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  available ? "bg-green-500" : "bg-gray-400"
                }`}
              />
              {available ? "Available" : "Unavailable"}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => handleToggle(true)}
              disabled={toggling || available}
              className="flex items-center gap-2 rounded-xl bg-[#0052CC] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0747A6] disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              Mark Available for 7 Days
            </button>

            <button
              onClick={() => handleToggle(false)}
              disabled={toggling || !available}
              className="flex items-center gap-2 rounded-xl border border-[#DFE1E6] px-5 py-2.5 text-sm font-semibold text-[#42526E] transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              <Clock3 className="h-4 w-4" />
              Mark Unavailable
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            label: "Profile",
            value: profile ? "Complete" : "Incomplete",
            icon: "👤",
            href: "/caretaker/profile",
            color: profile
              ? "bg-green-50 text-green-600"
              : "bg-yellow-50 text-yellow-600",
          },
          {
            label: "Application",
            value: statusInfo.label,
            icon: "📋",
            href: "/caretaker/application",
            color: "bg-blue-50 text-blue-600",
          },
          {
            label: "Notifications",
            value: unread,
            icon: "🔔",
            href: "/caretaker/notifications",
            color: "bg-purple-50 text-purple-600",
          },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-2xl border border-[#DFE1E6] bg-white p-6 transition hover:shadow-md"
          >
            <div
              className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${stat.color} text-2xl`}
            >
              {stat.icon}
            </div>
            <p className="text-lg font-bold text-[#091E42]">
              {loading ? "—" : stat.value}
            </p>
            <p className="mt-1 text-sm text-[#42526E]">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#DFE1E6] bg-white p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
              <Banknote className="h-5 w-5 text-emerald-600" />
            </div>
            <h2 className="text-base font-bold text-[#091E42]">Earnings</h2>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between border-b border-[#DFE1E6] py-2.5">
              <span className="text-sm text-[#42526E]">This month</span>
              <span className="text-sm font-bold text-[#091E42]">LKR —</span>
            </div>

            <div className="flex justify-between py-2.5">
              <span className="text-sm text-[#42526E]">Total earned</span>
              <span className="text-sm font-bold text-[#091E42]">LKR —</span>
            </div>
          </div>

          <p className="mt-3 text-xs text-gray-400">
            Earnings appear once bookings are completed.
          </p>
        </div>

        <div className="rounded-2xl border border-[#DFE1E6] bg-white p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <Briefcase className="h-5 w-5 text-[#0052CC]" />
            </div>
            <h2 className="text-base font-bold text-[#091E42]">
              Available Jobs
            </h2>
          </div>

          {!isApproved ? (
            <div className="flex items-start gap-3 rounded-xl bg-yellow-50 p-4">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" />
              <p className="text-sm text-yellow-700">
                Get approved to receive job requests from clients.
              </p>
            </div>
          ) : (
            <div className="py-2 text-center">
              <p className="text-4xl font-bold text-[#091E42]">0</p>
              <p className="mt-1 text-sm text-[#42526E]">
                Pending job requests
              </p>
              <p className="mt-3 text-xs text-gray-400">
                {available
                  ? "You are visible to clients. New requests will appear here."
                  : "Mark yourself available to start receiving job requests."}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-[#DFE1E6] bg-white p-6">
        <h2 className="mb-4 text-base font-bold text-[#091E42]">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/caretaker/profile"
            className="rounded-xl border border-[#DFE1E6] p-4 transition hover:border-[#0052CC] hover:bg-[#F4F8FF]"
          >
            <span className="text-2xl">✏️</span>
            <p className="mt-2 font-semibold text-[#091E42]">Update Profile</p>
            <p className="mt-1 text-xs text-[#42526E]">
              Edit skills, experience, and photo
            </p>
          </Link>

          {status !== "pending" && (
            <Link
              href="/caretaker/application"
              className="rounded-xl border border-[#DFE1E6] p-4 transition hover:border-[#0052CC] hover:bg-[#F4F8FF]"
            >
              <span className="text-2xl">📤</span>
              <p className="mt-2 font-semibold text-[#091E42]">
                {status === "not_applied"
                  ? "Submit Application"
                  : "View Application"}
              </p>
              <p className="mt-1 text-xs text-[#42526E]">
                Upload documents for OCR and admin review
              </p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

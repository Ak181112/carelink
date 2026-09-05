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
  AlertCircle,
  BadgeCheck,
  Clock3,
  CircleX,
  CircleDashed,
} from "lucide-react";

const statusConfig = {
  not_applied: {
    label: "Not Applied",
    color: "bg-gray-100 text-gray-600",
    icon: CircleDashed,
  },
  pending: {
    label: "Pending Review",
    color: "bg-yellow-100 text-yellow-700",
    icon: Clock3,
  },
  approved: {
    label: "Approved",
    color: "bg-green-100 text-green-700",
    icon: BadgeCheck,
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-600",
    icon: CircleX,
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

  const StatusIcon = statusInfo.icon;

  const isApproved = status === "approved";

  const addressMatched = application?.addressMatched;

 return (
  <div className="space-y-8">
    {/* Header */}
    <div>
      <h1 className="text-4xl font-bold text-[#091E42]">
        Welcome back,{" "}
        <span className="text-[#003898]">
          {user?.name?.split(" ")[0] || "Caretaker"}
        </span>
      </h1>

      <p className="mt-2 text-gray-500">
        Manage your caretaker profile, applications, availability and care
        requests from your professional dashboard.
      </p>
    </div>

    {/* Statistics Cards */}
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {[
        {
          label: "Profile",
          value: profile ? "Complete" : "Incomplete",
          icon: CheckCircle2,
          href: "/caretaker/profile",
          colorClass: profile
            ? "bg-green-100 text-green-600"
            : "bg-yellow-100 text-yellow-600",
        },
        {
          label: "Application",
          value: statusInfo.label,
          icon: Briefcase,
          href: "/caretaker/application",
          colorClass:
            status === "approved"
              ? "bg-green-100 text-green-600"
              : status === "pending"
              ? "bg-yellow-100 text-yellow-600"
              : status === "rejected"
              ? "bg-red-100 text-red-600"
              : "bg-[#EEF4FF] text-[#003898]",
        },
        {
          label: "Unread Notifications",
          value: unread,
          icon: AlertCircle,
          href: "/caretaker/notifications",
          colorClass:
            unread > 0
              ? "bg-amber-100 text-amber-600"
              : "bg-yellow-100 text-yellow-600",
        },
      ].map((stat) => {
        const Icon = stat.icon;

        return (
          <Link
            key={stat.label}
            href={stat.href}
            className="group rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>

                <h2 className="mt-2 text-3xl font-bold text-[#091E42]">
                  {loading ? (
                    <span className="inline-block h-8 w-20 animate-pulse rounded-lg bg-zinc-100" />
                  ) : (
                    stat.value
                  )}
                </h2>
              </div>

              <div
                className={`flex h-14 w-14 items-center justify-center rounded-xl ${stat.colorClass}`}
              >
                <Icon size={28} />
              </div>
            </div>

            <div className="mt-4 flex translate-x-[-4px] items-center text-xs font-semibold text-[#003898] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
              View details
            </div>
          </Link>
        );
      })}
    </div>

    {/* Application Status */}
    <div
      className={`rounded-2xl border shadow-sm p-6 ${
        status === "approved"
          ? "border-green-200 bg-green-50"
          : status === "pending"
          ? "border-yellow-200 bg-yellow-50"
          : status === "rejected"
          ? "border-red-200 bg-red-50"
          : "border-gray-200 bg-gray-50"
      }`}
    >
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-xl ${
             status === "approved" && <BadgeCheck className="h-7 w-7" />}

  {status === "pending" && <Clock3 className="h-7 w-7" />}

  {status === "rejected" && <CircleX className="h-7 w-7" />}

  {status === "not_applied" && <CircleDashed className="h-7 w-7" />}
</div
            }`}
          >
            <span className="text-2xl">{<StatusIcon />}</span>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Caretaker Verification
            </p>

            <h2 className="mt-1 text-2xl font-bold text-[#091E42]">
              {statusInfo.label}
            </h2>

            {status === "not_applied" && (
              <p className="mt-2 text-sm text-gray-600">
                Complete your caretaker profile and submit your application to
                begin receiving care requests.
              </p>
            )}

            {status === "pending" && (
              <p className="mt-2 text-sm text-gray-600">
                Your application is currently under administrative review.
              </p>
            )}

            {status === "approved" && (
              <p className="mt-2 text-sm text-gray-600">
                Congratulations! Your profile is verified and you can now accept
                care requests.
              </p>
            )}

            {status === "rejected" && (
              <p className="mt-2 text-sm text-red-600">
                Your application requires updates before approval. Please review
                the submitted information and apply again.
              </p>
            )}
          </div>
        </div>

        {status !== "pending" && (
          <Link
            href="/caretaker/application"
            className="inline-flex items-center justify-center rounded-xl bg-[#003898] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#002D73]"
          >
            {status === "not_applied"
              ? "Apply Now"
              : status === "approved"
              ? "View Application"
              : "Update Application"}
          </Link>
        )}
      </div>
    </div>

    {/* Availability */}
    {isApproved && (
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#091E42]">
              Availability Status
            </h2>

            <p className="mt-2 text-gray-500">
              Choose whether families can discover and book your services.
            </p>

            <div
              className={`mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                available
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  available ? "bg-green-500" : "bg-gray-400"
                }`}
              />

              {available ? "Currently Available" : "Currently Unavailable"}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleToggle(true)}
              disabled={available || toggling}
              className="rounded-xl bg-[#003898] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#002D73] disabled:opacity-50"
            >
              Mark Available
            </button>

            <button
              onClick={() => handleToggle(false)}
              disabled={!available || toggling}
              className="rounded-xl border px-6 py-3 text-sm font-semibold text-gray-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              Mark Unavailable
            </button>
          </div>
        </div>
      </div>
    )}


    {/* Earnings & Jobs */}
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Earnings */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Earnings</p>
            <h2 className="mt-1 text-2xl font-bold text-[#091E42]">
              Income Overview
            </h2>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-green-600">
            <Banknote className="h-7 w-7" />
          </div>
        </div>

        <div className="mt-8 space-y-5">
          <div className="flex items-center justify-between border-b pb-4">
            <span className="text-gray-500">This Month</span>

            <span className="font-bold text-[#091E42]">
              LKR —
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-500">Total Earnings</span>

            <span className="font-bold text-[#091E42]">
              LKR —
            </span>
          </div>
        </div>

        <p className="mt-6 text-xs text-gray-400">
          Earnings will automatically appear after completed bookings.
        </p>
      </div>

      {/* Jobs */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Bookings</p>

            <h2 className="mt-1 text-2xl font-bold text-[#091E42]">
              Available Jobs
            </h2>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#EEF4FF] text-[#003898]">
            <Briefcase className="h-7 w-7" />
          </div>
        </div>

        {!isApproved ? (
          <div className="mt-8 rounded-xl bg-yellow-50 p-5">
            <div className="flex gap-3">
              <AlertCircle className="mt-1 h-5 w-5 text-yellow-600" />

              <div>
                <p className="font-semibold text-yellow-700">
                  Approval Required
                </p>

                <p className="mt-1 text-sm text-yellow-700">
                  Once your application is approved you&apos;ll begin receiving care
                  requests from clients.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 text-center">
            <p className="text-5xl font-bold text-[#091E42]">
              0
            </p>

            <p className="mt-2 text-gray-500">
              Pending Job Requests
            </p>

            <p className="mt-5 text-sm text-gray-400">
              {available
                ? "You are visible to families. New booking requests will appear here."
                : "Enable availability to begin receiving new bookings."}
            </p>
          </div>
        )}
      </div>
    </div>

    {/* Quick Actions */}
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-2xl font-bold text-[#091E42]">
        Quick Actions
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/caretaker/profile"
          className="group rounded-xl border bg-zinc-50/20 p-5 transition hover:border-[#003898] hover:bg-white"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EEF4FF]">
            <CheckCircle2 className="h-5 w-5 text-[#003898]" />
          </div>

          <p className="mt-4 font-bold text-[#003898]">
            Update Profile
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Manage your experience, skills and personal details.
          </p>
        </Link>

        {status !== "pending" && (
          <Link
            href="/caretaker/application"
            className="group rounded-xl border bg-zinc-50/20 p-5 transition hover:border-[#003898] hover:bg-white"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EEF4FF]">
              <Briefcase className="h-5 w-5 text-[#003898]" />
            </div>

            <p className="mt-4 font-bold text-[#003898]">
              {status === "not_applied"
                ? "Submit Application"
                : "View Application"}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Upload documents and manage your verification.
            </p>
          </Link>
        )}

        <Link
          href="/caretaker/notifications"
          className="group rounded-xl border bg-zinc-50/20 p-5 transition hover:border-[#003898] hover:bg-white"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
          </div>

          <p className="mt-4 font-bold text-[#003898]">
            Notifications
          </p>

          <p className="mt-1 text-xs text-gray-500">
            View booking updates and important alerts.
          </p>
        </Link>

        <Link
          href="/caretaker/profile"
          className="group rounded-xl border bg-zinc-50/20 p-5 transition hover:border-[#003898] hover:bg-white"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
            <Clock3 className="h-5 w-5 text-green-600" />
          </div>

          <p className="mt-4 font-bold text-[#003898]">
            Availability
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Keep your availability updated for new bookings.
          </p>
        </Link>
      </div>
    </div>

    {/* CareLink Banner */}
    <div className="relative overflow-hidden rounded-2xl border border-[#003898]/15 bg-[#EEF4FF]/60 p-6 shadow-sm sm:p-8">
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#003898]/5 blur-[60px]" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#003898]/20 bg-white">
            <CheckCircle2 className="h-5 w-5 text-[#003898]" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#091E42]">
              Deliver Compassionate Care
            </h3>

            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-500">
              Keep your profile updated, stay available, and provide trusted,
              high-quality care to families across the CareLink+ network.
            </p>
          </div>
        </div>

        <Link
          href="/caretaker/profile"
          className="inline-flex items-center justify-center rounded-xl bg-[#003898] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#002D73]"
        >
          Update Profile
        </Link>
      </div>
    </div>
  </div>
);}
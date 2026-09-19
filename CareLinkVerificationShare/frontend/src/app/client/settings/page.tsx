"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  UserCircle,
  ShieldCheck,
  AlertTriangle,
  KeyRound,
  LogOut,
  Mail,
  BadgeCheck,
} from "lucide-react";

export default function ClientSettingsPage() {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-8 max-w-3xl">

      {/* Header */}

      <div>

        <h1 className="text-4xl font-bold text-[#091E42]">
          Settings
        </h1>

        <p className="mt-2 text-gray-500">
          Manage your account settings and preferences.
        </p>

      </div>

      {/* Account Information */}

      <div className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300 p-6">

        <div className="flex items-center gap-3 mb-6">

          <div className="h-12 w-12 rounded-xl bg-[#F8FAFF] border border-[#E6EEFF] flex items-center justify-center">

            <UserCircle className="h-6 w-6 text-[#003898]" />

          </div>

          <div>

            <h2 className="text-2xl font-bold text-[#091E42]">
              Account Information
            </h2>

            <p className="text-sm text-gray-500">
              View your account details.
            </p>

          </div>

        </div>

        <div className="space-y-4">

          {/* Name */}

          <div className="flex items-center justify-between py-3 border-b border-gray-100">

            <div className="flex items-center gap-3">

              <UserCircle className="h-5 w-5 text-[#003898]" />

              <span className="text-gray-500 font-medium">
                Name
              </span>

            </div>

            <span className="font-semibold text-[#091E42]">
              {user?.name}
            </span>

          </div>

          {/* Email */}

          <div className="flex items-center justify-between py-3 border-b border-gray-100">

            <div className="flex items-center gap-3">

              <Mail className="h-5 w-5 text-[#003898]" />

              <span className="text-gray-500 font-medium">
                Email
              </span>

            </div>

            <span className="font-semibold text-[#091E42]">
              {user?.email}
            </span>

          </div>

          {/* Role */}

          <div className="flex items-center justify-between py-3">

            <div className="flex items-center gap-3">

              <BadgeCheck className="h-5 w-5 text-[#003898]" />

              <span className="text-gray-500 font-medium">
                Role
              </span>

            </div>

            <span className="rounded-full bg-[#EEF4FF] px-4 py-1.5 text-sm font-semibold text-[#0052CC]">
              Family Member
            </span>

          </div>

        </div>

      </div>

            {/* Security */}

      <div className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300 p-6">

        <div className="flex items-center gap-3 mb-6">

          <div className="h-12 w-12 rounded-xl bg-[#F8FAFF] border border-[#E6EEFF] flex items-center justify-center">

            <ShieldCheck className="h-6 w-6 text-[#003898]" />

          </div>

          <div>

            <h2 className="text-2xl font-bold text-[#091E42]">
              Security
            </h2>

            <p className="text-sm text-gray-500">
              Keep your account secure.
            </p>

          </div>

        </div>

        <a
          href="/forgot-password"
          className="flex items-center justify-center gap-2 w-full rounded-xl border border-[#003898] px-5 py-3 font-semibold text-[#003898] hover:bg-blue-50 transition-all duration-300"
        >

          <KeyRound className="h-5 w-5" />

          Change Password

        </a>

      </div>

      {/* Danger Zone */}

      <div className="bg-red-50 rounded-2xl border border-red-200 p-6">

        <div className="flex items-center gap-3 mb-4">

          <div className="h-12 w-12 rounded-xl bg-white border border-red-200 flex items-center justify-center">

            <AlertTriangle className="h-6 w-6 text-red-600" />

          </div>

          <div>

            <h2 className="text-2xl font-bold text-red-600">
              Danger Zone
            </h2>

            <p className="text-sm text-gray-500">
              Actions that require extra attention.
            </p>

          </div>

        </div>

        <p className="text-gray-600 leading-7 mb-6">

          Once you log out, you will need to sign in again to access your
          CareLink+ account.

        </p>

        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 transition-all duration-300"
        >

          <LogOut className="h-5 w-5" />

          Log Out

        </button>

      </div>

    </div>
  );
}
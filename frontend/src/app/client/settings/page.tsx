"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState, type FormEvent } from "react";
import { authAPI } from "@/services/api";
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
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const handleChangePassword = async (event: FormEvent) => {
    event.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation password do not match.");
      return;
    }

    setPasswordLoading(true);

    try {
      await authAPI.changePassword({
        currentPassword,
        newPassword,
      });

      setPasswordSuccess("Password changed successfully.");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      setPasswordError(
        error instanceof Error ? error.message : "Unable to change password.",
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}

      <div>
        <h1 className="text-4xl font-bold text-[#091E42]">Settings</h1>

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

            <p className="text-sm text-gray-500">View your account details.</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Name */}

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <UserCircle className="h-5 w-5 text-[#003898]" />

              <span className="text-gray-500 font-medium">Name</span>
            </div>

            <span className="font-semibold text-[#091E42]">{user?.name}</span>
          </div>

          {/* Email */}

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-[#003898]" />

              <span className="text-gray-500 font-medium">Email</span>
            </div>

            <span className="font-semibold text-[#091E42]">{user?.email}</span>
          </div>

          {/* Role */}

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <BadgeCheck className="h-5 w-5 text-[#003898]" />

              <span className="text-gray-500 font-medium">Role</span>
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
            <h2 className="text-2xl font-bold text-[#091E42]">Security</h2>

            <p className="text-sm text-gray-500">Keep your account secure.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowChangePassword((previous) => !previous);
            setPasswordError("");
            setPasswordSuccess("");
          }}
          className="flex items-center justify-center gap-2 w-full rounded-xl border border-[#003898] px-5 py-3 font-semibold text-[#003898] hover:bg-blue-50 transition-all duration-300"
        >
          <KeyRound className="h-5 w-5" />
          {showChangePassword ? "Close Change Password" : "Change Password"}
        </button>
        {showChangePassword && (
          <form
            onSubmit={handleChangePassword}
            className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5"
          >
            <div className="mb-5">
              <h3 className="text-lg font-bold text-[#091E42]">
                Change your password
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Enter your current password and choose a new password for your
                CareLink+ account.
              </p>
            </div>

            {passwordError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {passwordSuccess}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Current Password
                </label>

                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                  required
                  disabled={passwordLoading}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-[#091E42] outline-none transition focus:border-[#003898] focus:ring-2 focus:ring-[#003898]/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  New Password
                </label>

                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                  disabled={passwordLoading}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-[#091E42] outline-none transition focus:border-[#003898] focus:ring-2 focus:ring-[#003898]/10 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <p className="mt-1.5 text-xs text-slate-400">
                  Minimum 6 characters.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Confirm New Password
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  required
                  disabled={passwordLoading}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-[#091E42] outline-none transition focus:border-[#003898] focus:ring-2 focus:ring-[#003898]/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowChangePassword(false);
                  setPasswordError("");
                  setPasswordSuccess("");
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                disabled={passwordLoading}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={passwordLoading}
                className="inline-flex items-center justify-center rounded-xl bg-[#003898] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#002E7A] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {passwordLoading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Danger Zone */}

      <div className="bg-red-50 rounded-2xl border border-red-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-xl bg-white border border-red-200 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-red-600">Danger Zone</h2>

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

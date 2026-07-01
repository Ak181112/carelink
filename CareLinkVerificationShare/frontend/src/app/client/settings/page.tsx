"use client";

import { useAuth } from "@/contexts/AuthContext";

export default function ClientSettingsPage() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#091E42]">Settings</h1>
        <p className="mt-1 text-[#42526E]">Manage your account settings and preferences</p>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-[#DFE1E6] p-6">
          <h2 className="text-lg font-bold text-[#091E42] mb-4">Account Information</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-[#DFE1E6]">
              <span className="text-[#42526E]">Name</span>
              <span className="font-medium text-[#091E42]">{user?.name}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#DFE1E6]">
              <span className="text-[#42526E]">Email</span>
              <span className="font-medium text-[#091E42]">{user?.email}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[#42526E]">Role</span>
              <span className="rounded-full bg-[#EEF4FF] px-3 py-1 text-xs font-medium text-[#0052CC]">Family Member</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#DFE1E6] p-6">
          <h2 className="text-lg font-bold text-[#091E42] mb-4">Security</h2>
          <a href="/forgot-password"
            className="block w-full rounded-xl border border-[#DFE1E6] px-5 py-3 text-sm font-medium text-[#091E42] hover:bg-gray-50 transition">
            🔑 Change Password
          </a>
        </div>

        <div className="bg-white rounded-2xl border border-red-100 p-6">
          <h2 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h2>
          <p className="text-sm text-[#42526E] mb-4">Once you log out, you will need to sign in again to access your account.</p>
          <button onClick={logout}
            className="rounded-xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition">
            🚪 Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

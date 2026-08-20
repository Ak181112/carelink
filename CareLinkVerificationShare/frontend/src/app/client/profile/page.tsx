"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authAPI } from "@/services/api";

import { formatPhoneNumber, isValidPhoneNumber } from "@/lib/phoneUtils";
import { formatName } from "@/lib/inputUtils";

export default function ClientProfilePage() {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  // seeded from `user` when edit mode opens, so no effect has to keep it in sync
  const [form, setForm] = useState({ name: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const startEditing = () => {
    setForm({ name: user?.name || "", phone: user?.phone || "" });
    setError("");
    setSuccess("");
    setEditing(true);
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }

    if (form.phone && !isValidPhoneNumber(form.phone)) {
      setError("Phone number must be a 10-digit Sri Lankan number starting with 07 (e.g. 0712345678)");
      return;
    }

    setSaving(true);
    try {
      await authAPI.updateMe({ name: form.name.trim(), phone: form.phone });
      await refreshUser();
      setSuccess("Profile saved successfully");
      setEditing(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const field = (label: string, key: keyof typeof form, type = "text") => (
    <div>
      <label className="block text-sm font-medium text-[#091E42] mb-2">{label}</label>
      {editing ? (
        <input
          type={type}
          value={form[key]}
          maxLength={key === "phone" ? 10 : undefined}
          placeholder={key === "phone" ? "07XXXXXXXX" : undefined}
          onChange={(e) => {
            const val = key === "phone"
              ? formatPhoneNumber(e.target.value)
              : formatName(e.target.value);
            setForm((f) => ({ ...f, [key]: val }));
          }}
          className="h-12 w-full rounded-xl border border-[#DFE1E6] px-4 text-sm outline-none focus:border-[#0052CC]"
        />
      ) : (
        <div className="h-12 flex items-center px-4 rounded-xl bg-[#F8FAFC] border border-[#DFE1E6] text-sm text-[#091E42]">
          {user?.[key] || <span className="text-[#6B7280]">Not set</span>}
        </div>
      )}
    </div>
  );

  const readOnlyField = (label: string, value?: string) => (
    <div>
      <label className="block text-sm font-medium text-[#091E42] mb-2">{label}</label>
      <div className="h-12 flex items-center px-4 rounded-xl bg-[#F8FAFC] border border-[#DFE1E6] text-sm text-[#091E42]">
        {value || <span className="text-[#6B7280]">Not set</span>}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#091E42]">My Profile</h1>
          <p className="mt-1 text-[#42526E]">Manage your personal information</p>
        </div>
        {!editing ? (
          <button
            onClick={startEditing}
            className="rounded-xl bg-[#0052CC] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#0747A6] transition"
          >
            ✏️ Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => { setEditing(false); setError(""); setSuccess(""); }}
              className="rounded-xl border border-[#DFE1E6] px-5 py-2.5 text-sm font-semibold text-[#42526E] hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-[#0052CC] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#0747A6] disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      {success && <div className="mb-6 rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-700">{success}</div>}
      {error && <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">{error}</div>}

      {/* Avatar */}
      <div className="bg-white rounded-2xl border border-[#DFE1E6] p-6 mb-6">
        <div className="flex items-center gap-5">
          <div className="h-20 w-20 rounded-full bg-[#0052CC] flex items-center justify-center text-white text-3xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#091E42]">{user?.name}</h2>
            <p className="text-sm text-[#42526E] mt-1">Family Member</p>
            <span className="mt-2 inline-block rounded-full bg-green-100 text-green-700 text-xs px-3 py-1 font-medium">
              ✓ Verified
            </span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-[#DFE1E6] p-6 space-y-5">
        <h2 className="text-lg font-bold text-[#091E42]">Personal Information</h2>
        {field("Full Name", "name")}
        {readOnlyField("Email Address", user?.email)}
        {field("Phone Number", "phone", "tel")}
        <div>
          <label className="block text-sm font-medium text-[#091E42] mb-2">Account Role</label>
          <div className="h-12 flex items-center px-4 rounded-xl bg-[#F4F8FF] border border-[#DFE1E6] text-sm text-[#0052CC] font-medium">
            Family Member
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Bell, Lock, Hospital, ShieldCheck } from "lucide-react";

const PREFERRED_HOSPITALS = [
  "Teaching Hospital Kurunegala",
  "District General Hospital Kurunegala",
  "Asiri Hospital Kurunegala",
  "Lanka Hospital Kurunegala",
  "Nawaloka Clinic Kurunegala",
];

// Declared at module scope: a component defined inside the page body would be a
// brand new type on every render, remounting the toggle and losing its state.
function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative h-6 w-11 rounded-full transition-colors ${
        value ? "bg-[#0052CC]" : "bg-gray-200"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          value ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function CaretakerSettingsPage() {
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySMS, setNotifySMS] = useState(false);
  const [notifyBookings, setNotifyBookings] = useState(true);
  const [profileVisible, setProfileVisible] = useState(true);
  const [selectedHospitals, setSelectedHospitals] = useState<string[]>([
    "Teaching Hospital Kurunegala",
    "District General Hospital Kurunegala",
  ]);
  const [saved, setSaved] = useState(false);

  const toggleHospital = (h: string) => {
    setSelectedHospitals((prev) =>
      prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h]
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#091E42]">Settings</h1>
        <p className="mt-1 text-[#42526E]">Manage your preferences and account settings.</p>
      </div>

      {saved && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-700">
          Settings saved successfully!
        </div>
      )}

      {/* Notifications */}
      <div className="bg-white rounded-2xl border border-[#DFE1E6] p-6">
        <div className="flex items-center gap-2 mb-5">
          <Bell className="h-5 w-5 text-[#0052CC]" />
          <h2 className="text-base font-bold text-[#091E42]">Notifications</h2>
        </div>
        <div className="space-y-4">
          {[
            { label: "Email notifications", desc: "Receive updates via email", value: notifyEmail, onChange: setNotifyEmail },
            { label: "SMS notifications", desc: "Receive updates via SMS", value: notifySMS, onChange: setNotifySMS },
            { label: "Booking alerts", desc: "Get notified for new booking requests", value: notifyBookings, onChange: setNotifyBookings },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-3 border-b border-[#DFE1E6] last:border-0">
              <div>
                <p className="text-sm font-medium text-[#091E42]">{item.label}</p>
                <p className="text-xs text-[#42526E] mt-0.5">{item.desc}</p>
              </div>
              <Toggle value={item.value} onChange={item.onChange} />
            </div>
          ))}
        </div>
      </div>

      {/* Preferred Hospitals */}
      <div className="bg-white rounded-2xl border border-[#DFE1E6] p-6">
        <div className="flex items-center gap-2 mb-2">
          <Hospital className="h-5 w-5 text-[#0052CC]" />
          <h2 className="text-base font-bold text-[#091E42]">Preferred Hospitals in Kurunegala</h2>
        </div>
        <p className="mb-5 text-sm text-[#42526E]">
          Select hospitals where you are willing to accompany clients.
        </p>
        <div className="space-y-2">
          {PREFERRED_HOSPITALS.map((h) => (
            <label
              key={h}
              className="flex items-center gap-3 rounded-xl border border-[#DFE1E6] px-4 py-3 cursor-pointer hover:border-[#0052CC] hover:bg-[#F4F8FF] transition"
            >
              <input
                type="checkbox"
                checked={selectedHospitals.includes(h)}
                onChange={() => toggleHospital(h)}
                className="h-4 w-4 accent-[#0052CC]"
              />
              <span className="text-sm text-[#091E42]">{h}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-white rounded-2xl border border-[#DFE1E6] p-6">
        <div className="flex items-center gap-2 mb-5">
          <ShieldCheck className="h-5 w-5 text-[#0052CC]" />
          <h2 className="text-base font-bold text-[#091E42]">Privacy</h2>
        </div>
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-medium text-[#091E42]">Profile visibility</p>
            <p className="text-xs text-[#42526E] mt-0.5">Allow clients to find and view your profile</p>
          </div>
          <Toggle value={profileVisible} onChange={setProfileVisible} />
        </div>
      </div>

      {/* Password */}
      <div className="bg-white rounded-2xl border border-[#DFE1E6] p-6">
        <div className="flex items-center gap-2 mb-5">
          <Lock className="h-5 w-5 text-[#0052CC]" />
          <h2 className="text-base font-bold text-[#091E42]">Change Password</h2>
        </div>
        <div className="space-y-4">
          {["Current password", "New password", "Confirm new password"].map((label) => (
            <div key={label}>
              <label className="block text-sm font-medium text-[#091E42] mb-1.5">{label}</label>
              <input
                type="password"
                placeholder="••••••••"
                className="h-11 w-full rounded-xl border border-[#DFE1E6] px-4 text-sm outline-none focus:border-[#0052CC]"
              />
            </div>
          ))}
          <button className="rounded-xl border border-[#DFE1E6] px-5 py-2.5 text-sm font-medium text-[#091E42] hover:border-[#0052CC] hover:bg-[#F4F8FF] transition">
            Update Password
          </button>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full h-12 rounded-2xl bg-[#0052CC] text-base font-semibold text-white hover:bg-[#0747A6] transition"
      >
        Save Settings
      </button>
    </div>
  );
}

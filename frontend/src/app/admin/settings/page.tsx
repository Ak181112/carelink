"use client";

export default function AdminSettingsPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#091E42]">System Settings</h1>
        <p className="mt-1 text-[#42526E]">Configure platform settings</p>
      </div>

      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-[#DFE1E6] p-6">
          <h2 className="text-lg font-bold text-[#091E42] mb-4">Platform Configuration</h2>
          <div className="space-y-4">
            {[
              { label: "District Coverage", value: "Kurunegala District Only", readonly: true },
              { label: "Platform Name", value: "CareLink+", readonly: true },
              { label: "Support Email", value: "support@carelinkplus.lk", readonly: false },
            ].map((f) => (
              <div key={f.label}>
                <label className="block text-sm font-medium text-[#091E42] mb-1.5">{f.label}</label>
                <input defaultValue={f.value} readOnly={f.readonly}
                  className={`h-11 w-full rounded-xl border px-4 text-sm outline-none ${f.readonly ? "bg-[#F8FAFC] border-[#DFE1E6] text-[#42526E]" : "border-[#DFE1E6] focus:border-[#0052CC]"}`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#DFE1E6] p-6">
          <h2 className="text-lg font-bold text-[#091E42] mb-4">Application Settings</h2>
          <div className="space-y-3">
            {[
              { label: "Email Verification Required", enabled: true },
              { label: "Admin Approval Required for Caretakers", enabled: true },
              { label: "Public Caretaker Listings", enabled: true },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between py-2 border-b border-[#DFE1E6] last:border-0">
                <span className="text-sm text-[#091E42]">{s.label}</span>
                <div className={`h-6 w-11 rounded-full ${s.enabled ? "bg-[#0052CC]" : "bg-gray-300"} relative cursor-pointer`}>
                  <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${s.enabled ? "left-5" : "left-0.5"}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#DFE1E6] p-6">
          <h2 className="text-lg font-bold text-[#091E42] mb-4">Backend Configuration</h2>
          <div className="space-y-3 text-sm text-[#42526E]">
            <div className="flex justify-between py-2 border-b border-[#DFE1E6]">
              <span>Database</span><span className="font-medium text-[#091E42]">MongoDB Atlas</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#DFE1E6]">
              <span>Authentication</span><span className="font-medium text-[#091E42]">JWT (7 days)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#DFE1E6]">
              <span>File Storage</span><span className="font-medium text-[#091E42]">Local (uploads/)</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Email Service</span><span className="font-medium text-[#091E42]">Nodemailer (Gmail)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

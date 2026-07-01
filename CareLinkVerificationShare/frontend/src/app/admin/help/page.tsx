"use client";

import { useState } from "react";

const faqs = [
  { q: "How do I approve a caretaker application?", a: "Go to Applications page, select an application, review the documents, add an optional note, then click 'Approve'. The caretaker will be notified via email." },
  { q: "How do I reject an application?", a: "In the Applications page, open the application, write a reason in the Admin Note field (required for rejection), then click 'Reject'. The caretaker will be notified." },
  { q: "How do I deactivate a user account?", a: "Go to Users page, find the user, and click 'Deactivate'. The user will no longer be able to log in." },
  { q: "How are admin accounts created?", a: "Admin accounts cannot be created through the public registration form. Admin role must be set directly in the MongoDB database for security." },
  { q: "What documents are required for caretaker approval?", a: "The required document is the NIC (National Identity Card). Driving license and certificates are optional but help in the review process." },
  { q: "How does email verification work?", a: "When a user registers, they receive a verification email with a unique link. They must click this link to activate their account before logging in." },
];

export default function AdminHelpPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#091E42]">Help Center</h1>
        <p className="mt-1 text-[#42526E]">Frequently asked questions for administrators</p>
      </div>

      {/* Quick Guide */}
      <div className="bg-white rounded-2xl border border-[#DFE1E6] p-6 mb-6">
        <h2 className="text-lg font-bold text-[#091E42] mb-4">Quick Start Guide</h2>
        <div className="space-y-3">
          {[
            { step: "1", text: "Monitor the Dashboard for pending applications and system stats" },
            { step: "2", text: "Review caretaker applications in the Applications section" },
            { step: "3", text: "Approve qualified caretakers — they become visible to family members" },
            { step: "4", text: "Manage users from the Users section if needed" },
            { step: "5", text: "Monitor all activity through the Notifications page" },
          ].map((item) => (
            <div key={item.step} className="flex gap-4 items-start">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0052CC] text-white text-xs font-bold">
                {item.step}
              </div>
              <p className="text-sm text-[#42526E] pt-1">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-2xl border border-[#DFE1E6] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#DFE1E6]">
          <h2 className="font-bold text-[#091E42]">Frequently Asked Questions</h2>
        </div>
        <div className="divide-y divide-[#DFE1E6]">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[#F8FAFC] transition">
                <span className="font-medium text-[#091E42] text-sm">{faq.q}</span>
                <span className="text-[#42526E] text-lg ml-4">{open === i ? "−" : "+"}</span>
              </button>
              {open === i && (
                <div className="px-6 pb-4 text-sm text-[#42526E]">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="mt-6 bg-[#EEF4FF] rounded-2xl border border-[#C7D9FF] p-6 text-center">
        <span className="text-3xl">📧</span>
        <h3 className="mt-3 font-bold text-[#091E42]">Need more help?</h3>
        <p className="mt-1 text-sm text-[#42526E]">Contact the development team for technical support</p>
      </div>
    </div>
  );
}

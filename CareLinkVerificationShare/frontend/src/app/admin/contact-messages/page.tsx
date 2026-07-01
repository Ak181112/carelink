"use client";

import { useState, useEffect } from "react";
import { Mail, Search, Trash2, Eye, Clock } from "lucide-react";

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  createdAt: string;
  isRead?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/contact`)
      .then((r) => r.json())
      .then((d) => setMessages(d.messages || d.data || []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = messages.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.message.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#091E42]">Contact Messages</h1>
        <p className="mt-1 text-[#42526E]">Messages submitted from the Contact Us page.</p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search messages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 w-full rounded-xl border border-[#DFE1E6] pl-10 pr-4 text-sm outline-none focus:border-[#0052CC]"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Message list */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-[#DFE1E6] overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="animate-pulse space-y-2">
                  <div className="h-4 w-3/4 rounded bg-slate-200" />
                  <div className="h-3 w-1/2 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                <Mail className="h-6 w-6 text-[#0052CC]" />
              </div>
              <p className="text-sm font-medium text-[#091E42]">No messages yet</p>
              <p className="text-xs text-[#42526E] mt-1">Messages from the contact form will appear here.</p>
            </div>
          ) : (
            <ul className="divide-y divide-[#DFE1E6]">
              {filtered.map((msg) => (
                <li key={msg._id}>
                  <button
                    onClick={() => setSelected(msg)}
                    className={`w-full text-left px-5 py-4 hover:bg-[#F4F8FF] transition ${
                      selected?._id === msg._id ? "bg-[#EEF4FF] border-l-2 border-[#0052CC]" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#091E42] truncate">{msg.name}</p>
                        <p className="text-xs text-[#42526E] truncate">{msg.email}</p>
                        <p className="mt-1.5 text-xs text-gray-500 line-clamp-2">{msg.message}</p>
                      </div>
                      {!msg.isRead && (
                        <span className="h-2 w-2 rounded-full bg-[#0052CC] mt-1 shrink-0" />
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      {new Date(msg.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Message detail */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-white rounded-2xl border border-[#DFE1E6] p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#091E42]">{selected.name}</h2>
                  <a
                    href={`mailto:${selected.email}`}
                    className="text-sm text-[#0052CC] hover:underline"
                  >
                    {selected.email}
                  </a>
                  {selected.subject && (
                    <p className="mt-1 text-sm text-[#42526E]">
                      <span className="font-medium">Subject:</span> {selected.subject}
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {new Date(selected.createdAt).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="rounded-xl bg-[#F8FAFC] border border-[#DFE1E6] p-5">
                <p className="text-sm text-[#091E42] leading-relaxed whitespace-pre-wrap">
                  {selected.message}
                </p>
              </div>

              <a
                href={`mailto:${selected.email}`}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0052CC] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0747A6] transition"
              >
                <Mail className="h-4 w-4" />
                Reply via Email
              </a>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#DFE1E6] flex flex-col items-center justify-center py-24 text-center">
              <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <Eye className="h-7 w-7 text-[#0052CC]" />
              </div>
              <p className="text-base font-medium text-[#091E42]">Select a message to read</p>
              <p className="mt-1 text-sm text-[#42526E]">Click any message from the list to view it here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

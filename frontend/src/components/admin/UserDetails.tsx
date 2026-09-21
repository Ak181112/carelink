"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { adminAPI } from "@/services/api";

export default function UserDetails() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;

    adminAPI
      .getUserById(userId)
      .then((data) => setUser(data.user || data))
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : "Failed to load user.");
      });
  }, [userId]);

  if (!userId) {
    return <p className="text-slate-500">Select a user to view their details.</p>;
  }

  if (error) {
    return <p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>;
  }

  if (!user) {
    return <Loader2 className="animate-spin text-[#003898]" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-[#091E42]">User Details</h1>
        <p className="mt-1 text-slate-500">Account and profile information.</p>
      </div>
      <dl className="grid gap-4 rounded-2xl border bg-white p-6 shadow-sm sm:grid-cols-2">
        {Object.entries(user).map(([key, value]) => (
          <div key={key}>
            <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">{key}</dt>
            <dd className="mt-1 break-words text-sm text-slate-800">
              {typeof value === "object" ? JSON.stringify(value) : String(value ?? "-")}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
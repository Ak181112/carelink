"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { paymentAPI } from "@/services/api";

export default function PaymentDetails() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("id");
  const [payment, setPayment] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!paymentId) return;

    paymentAPI
      .get(paymentId)
      .then((data) => setPayment(data.payment || data))
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : "Failed to load payment.");
      });
  }, [paymentId]);

  if (!paymentId) {
    return <p className="text-slate-500">Select a payment to view its details.</p>;
  }

  if (error) {
    return <p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>;
  }

  if (!payment) {
    return <Loader2 className="animate-spin text-[#003898]" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-[#091E42]">Payment Details</h1>
        <p className="mt-1 text-slate-500">Receipt and transaction information.</p>
      </div>
      <dl className="grid gap-4 rounded-2xl border bg-white p-6 shadow-sm sm:grid-cols-2">
        {Object.entries(payment).map(([key, value]) => (
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
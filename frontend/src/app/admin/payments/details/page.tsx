import { Suspense } from "react";
import PaymentDetails from "@/components/admin/PaymentDetails";

export default function Page() {
  return (
    <Suspense fallback={<p className="text-slate-500">Loading payment details...</p>}>
      <PaymentDetails />
    </Suspense>
  );
}
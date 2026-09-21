"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function PaymentFailedContent() {
	const params = useSearchParams();
	const router = useRouter();
	const bookingId = params.get("booking_id") || "";

	return (
		<div className="min-h-screen bg-slate-50 grid place-items-center p-5">
			<div className="max-w-lg w-full bg-white border rounded-2xl shadow-sm p-8 text-center">
				<div className="mx-auto h-14 w-14 rounded-full bg-rose-50 text-rose-600 grid place-items-center text-2xl">!</div>
				<h1 className="text-2xl font-extrabold mt-5">Payment not completed</h1>
				<p className="text-slate-500 mt-2">Your booking has not been closed. You can retry securely from the booking status page.</p>
				<button onClick={() => router.push(`/client/booking-status?bookingId=${bookingId}`)} className="mt-7 w-full rounded-xl bg-[#003898] text-white py-3 font-semibold">Return to booking</button>
			</div>
		</div>
	);
}

export default function PaymentFailedPage() {
	return (
		<Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
			<PaymentFailedContent />
		</Suspense>
	);
}

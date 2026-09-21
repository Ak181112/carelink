"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CreditCard, Loader2 } from "lucide-react";
import { bookingAPI, paymentAPI } from "@/services/api";

function PaymentGatewayContent(){
  const params=useSearchParams(); const router=useRouter();
  const [booking,setBooking]=useState<any>(null); const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
  useEffect(()=>{const id=params.get("bookingId"); if(id) bookingAPI.get(id).then(d=>setBooking(d.booking)).catch(e=>setError(e.message));},[params]);
  const pay=async()=>{if(!booking?.paymentId)return; setBusy(true); try{const d=await paymentAPI.createCheckout(booking.paymentId); window.location.href=d.url;}catch(e:any){setError(e.message);setBusy(false);}};
  return <div className="min-h-screen bg-slate-50 p-4 sm:p-6 grid place-items-center"><div className="w-full max-w-xl rounded-2xl bg-white border shadow-sm p-6 sm:p-8"><div className="flex items-center gap-3"><div className="h-11 w-11 rounded-xl bg-blue-50 grid place-items-center"><CreditCard className="text-[#003898]"/></div><div><h1 className="text-2xl font-extrabold text-slate-900">Secure payment</h1><p className="text-sm text-slate-500">You will be redirected to Stripe Checkout.</p></div></div>{booking?<><div className="mt-7 rounded-xl bg-slate-50 p-5"><p className="text-sm text-slate-500">Booking</p><p className="font-semibold">#{String(booking._id).slice(-8).toUpperCase()}</p><div className="border-t mt-4 pt-4 flex justify-between"><span className="font-semibold">Total</span><span className="font-extrabold text-[#003898] text-xl">LKR {Number(booking.pricing?.total||0).toLocaleString()}</span></div></div><button onClick={pay} disabled={busy||booking.status!=="payment_pending"} className="mt-6 w-full rounded-xl bg-[#003898] text-white py-3.5 font-semibold disabled:opacity-50">{busy?<Loader2 className="animate-spin mx-auto"/>:`Pay with Stripe`}</button><p className="text-xs text-slate-400 mt-3 text-center">Card details are collected by Stripe; CareLink+ does not store card numbers.</p></>:<p className="mt-6 text-slate-500">Loading payment details...</p>}{error&&<div className="mt-4 bg-red-50 text-red-700 rounded-xl p-3 text-sm">{error}</div>}<button onClick={()=>router.back()} className="mt-5 w-full text-sm text-slate-500">Back</button></div></div>;
}

export default function PaymentGatewayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <PaymentGatewayContent />
    </Suspense>
  );
}

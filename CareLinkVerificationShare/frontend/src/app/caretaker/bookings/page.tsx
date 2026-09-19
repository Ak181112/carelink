"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock, MapPin, Check, X, Eye, Loader2 } from "lucide-react";
import { bookingAPI } from "@/services/api";

export default function CaretakerBookingsPage() {
  const router=useRouter();
  const [bookings,setBookings]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState("");
  const load=async()=>{try{const d=await bookingAPI.caretakerList();setBookings(d.bookings||[]);}catch(e:any){setMessage(e.message);}finally{setLoading(false);}};
  useEffect(()=>{load();},[]);
  const update=async(id:string,status:string)=>{try{await bookingAPI.updateStatus(id,status);await load();}catch(e:any){setMessage(e.message);}};
  if(loading)return <div className="min-h-screen grid place-items-center"><Loader2 className="animate-spin text-[#003898]"/></div>;
  return <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8"><main className="max-w-7xl mx-auto"><div className="mb-7"><h1 className="text-3xl font-extrabold text-slate-900">My bookings</h1><p className="text-slate-500 mt-1">Accept requests, manage live hospital visits and complete tasks.</p></div>{message&&<div className="mb-5 rounded-xl bg-red-50 border border-red-100 p-4 text-red-700">{message}</div>}<div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">{bookings.length===0?<div className="rounded-2xl bg-white border p-8 text-slate-500">No booking requests yet.</div>:bookings.map(b=><div key={b._id} className="rounded-2xl bg-white border shadow-sm p-5"><div className="flex justify-between gap-3"><div><p className="text-xs text-slate-400 font-semibold">#{String(b._id).slice(-8).toUpperCase()}</p><h2 className="font-bold text-lg text-slate-900 mt-1">{b.parentId?.fullName}</h2></div><span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold h-fit">{b.status}</span></div><div className="space-y-3 mt-5 text-sm"><div className="flex gap-2"><MapPin size={17} className="text-[#003898]"/><span>{b.pickupLocation?.address}</span></div><div className="flex gap-2"><CalendarDays size={17} className="text-[#003898]"/><span>{new Date(b.scheduledDate).toLocaleDateString()}</span></div><div className="flex gap-2"><Clock size={17} className="text-[#003898]"/><span>{b.startTime}</span></div><div className="pt-2 font-bold text-[#003898]">LKR {Number(b.pricing?.total||0).toLocaleString()}</div></div><div className="grid grid-cols-2 gap-2 mt-5">{b.status==="requested"&&<><button onClick={()=>update(b._id,"accepted")} className="rounded-xl bg-emerald-600 text-white py-2.5 font-semibold flex items-center justify-center gap-1"><Check size={16}/> Accept</button><button onClick={()=>update(b._id,"rejected")} className="rounded-xl bg-rose-600 text-white py-2.5 font-semibold flex items-center justify-center gap-1"><X size={16}/> Reject</button></>}{["accepted","in_progress"].includes(b.status)&&<button onClick={()=>router.push(`/caretaker/current-visit?bookingId=${b._id}`)} className="col-span-2 rounded-xl bg-[#003898] text-white py-2.5 font-semibold flex items-center justify-center gap-1"><Eye size={16}/> Open visit</button>}{b.caretakerCompletedAt&&<span className="col-span-2 text-center text-sm text-emerald-700 font-semibold">Caretaker task completed</span>}</div></div>)}</div></main></div>;
}

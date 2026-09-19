"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, MapPin, Star, CheckCircle2, ArrowRight } from "lucide-react";
import { recommendationAPI } from "@/services/api";

export default function RecommendationPage(){
  const [rows,setRows]=useState<any[]>([]); const [loading,setLoading]=useState(true); const [message,setMessage]=useState("");
  useEffect(()=>{
    const load=async()=>{
      try{
        if(navigator.geolocation){
          navigator.geolocation.getCurrentPosition(async p=>{const d=await recommendationAPI.get({lat:p.coords.latitude,lng:p.coords.longitude});setRows(d.recommendations||[]);setLoading(false);},async()=>{const d=await recommendationAPI.get();setRows(d.recommendations||[]);setLoading(false);});
        } else { const d=await recommendationAPI.get();setRows(d.recommendations||[]);setLoading(false); }
      }catch(e:any){setMessage(e.message);setLoading(false);}
    };load();
  },[]);
  return <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8"><main className="max-w-7xl mx-auto"><div className="mb-7"><p className="text-sm font-semibold text-[#003898]">Smart recommendation</p><h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">Recommended caretakers</h1><p className="text-slate-500 mt-2">Caretakers are ranked using the proposal scoring model: availability 30%, location 25%, rating 20%, completed services 15%, previous interaction 10%.</p></div>{message&&<div className="mb-5 rounded-xl bg-red-50 text-red-700 p-4">{message}</div>}{loading?<div className="py-20 grid place-items-center"><Loader2 className="animate-spin text-[#003898]" size={32}/></div>:<div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">{rows.map((r,i)=>{const c=r.caretaker;return <div key={c._id} className="rounded-2xl bg-white border shadow-sm p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-slate-400 uppercase">#{i+1} recommendation</p><h2 className="text-xl font-extrabold text-slate-900 mt-1">{c.fullName}</h2><p className="text-sm text-slate-500 mt-1">{c.town}, {c.district}</p></div><div className="rounded-xl bg-blue-50 px-3 py-2 text-center"><p className="text-xs text-[#003898] font-bold">Score</p><p className="font-extrabold text-[#003898]">{r.recommendationScore}</p></div></div><div className="flex items-center gap-3 mt-5 text-sm"><span className="font-semibold text-amber-600 flex items-center gap-1"><Star size={15} fill="currentColor"/>{c.averageRating?.toFixed?.(1)||"0.0"}</span>{r.distanceKm!=null&&<span className="text-slate-500 flex items-center gap-1"><MapPin size={15}/>{r.distanceKm} km</span>}<span className={`flex items-center gap-1 ${c.isAvailable?'text-emerald-600':'text-rose-600'}`}>{c.isAvailable&&<CheckCircle2 size={15}/>} {c.isAvailable?'Available':'Busy'}</span></div><div className="mt-5 grid grid-cols-2 gap-2 text-xs"><div className="rounded-lg bg-slate-50 p-2"><b>A 30%</b><p>{r.factors?.availability}</p></div><div className="rounded-lg bg-slate-50 p-2"><b>L 25%</b><p>{r.factors?.location}</p></div><div className="rounded-lg bg-slate-50 p-2"><b>R 20%</b><p>{r.factors?.rating}</p></div><div className="rounded-lg bg-slate-50 p-2"><b>C 15%</b><p>{r.factors?.completedServices}</p></div><div className="rounded-lg bg-slate-50 p-2 col-span-2"><b>P 10%</b><p>{r.factors?.previousInteraction}</p></div></div><Link href={`/client/book-hospital-visit?caretakerId=${c.userId?._id||c.userId}`} className="mt-5 w-full rounded-xl bg-[#003898] text-white py-3 font-semibold flex items-center justify-center gap-2">Book this caretaker <ArrowRight size={17}/></Link></div>})}</div>}</main></div>;
}

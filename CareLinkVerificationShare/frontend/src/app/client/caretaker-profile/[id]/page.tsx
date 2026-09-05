"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Star, Briefcase, BadgeCheck, Loader2 } from "lucide-react";
import { caretakerAPI } from "@/services/api";

export default function CaretakerProfilePage() {
  const params = useParams();
  const id = String(params.id || "");
  const [caretaker, setCaretaker] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (id) caretakerAPI.getById(id).then(d => setCaretaker(d.caretaker)).finally(() => setLoading(false)); }, [id]);
  if (loading) return <div className="min-h-screen grid place-items-center bg-slate-50"><Loader2 className="animate-spin text-[#003898]"/></div>;
  if (!caretaker) return <div className="min-h-screen grid place-items-center bg-slate-50"><div className="rounded-2xl border bg-white p-8 text-center"><h2 className="text-2xl font-bold">Caretaker not found</h2><p className="mt-2 text-slate-500">This caretaker may no longer be available.</p></div></div>;

  const reviews = caretaker.reviews || [];
  return <div className="min-h-screen bg-slate-50"><main className="mx-auto max-w-7xl space-y-7 p-4 sm:p-6 lg:p-8">
    <Link href="/client/caretaker-recommendation" className="inline-flex items-center gap-2 font-semibold text-[#003898]"><ArrowLeft size={18}/> Back to recommendations</Link>
    <section className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8"><div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between"><div className="flex flex-col gap-5 sm:flex-row sm:items-center"><div className="grid h-24 w-24 shrink-0 place-items-center rounded-full bg-[#003898] text-4xl font-bold text-white">{(caretaker.fullName || caretaker.userId?.name || "C").charAt(0)}</div><div><h1 className="text-3xl font-extrabold text-slate-900">{caretaker.fullName || caretaker.userId?.name}</h1><p className="mt-1 text-slate-500">Verified hospital visit caretaker</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm"><span className="inline-flex items-center gap-2"><MapPin size={17}/>{caretaker.town}, {caretaker.district}</span><span className="inline-flex items-center gap-2 text-amber-600"><Star size={17} className="fill-current"/>{Number(caretaker.averageRating || 0).toFixed(1)} / 5</span><span className="inline-flex items-center gap-2"><Briefcase size={17}/>{caretaker.experience}</span></div></div></div><div className="lg:text-right"><p className="text-sm text-slate-500">Caretaker service charge</p><p className="mt-1 text-3xl font-extrabold text-[#003898]">Calculated at booking</p><Link href={`/client/book-hospital-visit?caretakerId=${id}`} className="mt-4 inline-flex rounded-xl bg-[#003898] px-7 py-3 font-semibold text-white">Book this caretaker</Link></div></div></section>
    <div className="grid gap-7 lg:grid-cols-3"><div className="space-y-7 lg:col-span-2"><section className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">Profile</h2><p className="mt-3 leading-8 text-slate-600">{caretaker.about || `Experienced caretaker from ${caretaker.town}, providing elderly hospital visit assistance.`}</p></section><section className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">Skills & qualifications</h2><div className="mt-5 flex flex-wrap gap-3">{[...(caretaker.skills || []), caretaker.qualifications].filter(Boolean).map((skill: string) => <span key={skill} className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-[#003898]"><BadgeCheck size={16}/>{skill}</span>)}</div></section></div><aside className="rounded-2xl border bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">Client reviews</h2><div className="flex items-center gap-1 text-amber-600"><Star size={17} className="fill-current"/>{Number(caretaker.averageRating || 0).toFixed(1)}</div></div><div className="mt-5 space-y-4">{reviews.length ? reviews.map((r:any)=><div key={r._id || `${r.createdAt}-${r.clientName}`} className="rounded-xl bg-slate-50 p-4"><div className="flex gap-1">{Array.from({length:5}).map((_,i)=><Star key={i} size={14} className={i < r.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}/>)}</div><p className="mt-2 text-sm leading-6 text-slate-600">{r.comment || "No written feedback."}</p><p className="mt-3 text-xs font-semibold text-slate-400">{r.clientName || "Client"}</p></div>) : <p className="text-sm text-slate-500">No reviews yet.</p>}</div></aside></div>
  </main></div>;
}

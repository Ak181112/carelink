"use client";

import { useEffect, useState } from "react";
import { Bell, Lock, ShieldCheck, WalletCards, ExternalLink, Loader2 } from "lucide-react";
import { paymentAPI } from "@/services/api";

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return <button type="button" onClick={() => onChange(!value)} className={`relative h-6 w-11 rounded-full ${value ? "bg-[#003898]" : "bg-gray-300"}`}><span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${value ? "translate-x-5" : ""}`} /></button>;
}

export default function CaretakerSettingsPage() {
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySMS, setNotifySMS] = useState(false);
  const [notifyBookings, setNotifyBookings] = useState(true);
  const [profileVisible, setProfileVisible] = useState(true);
  const [balance, setBalance] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const loadBalance = async () => {
    try { const d = await paymentAPI.connectBalance(); setBalance(d); } catch (e: any) { setMessage(e.message); }
  };
  useEffect(() => { loadBalance(); }, []);

  const onboard = async () => {
    setBusy(true); setMessage("");
    try { const d = await paymentAPI.connectOnboarding(); window.location.href = d.url; } catch (e: any) { setMessage(e.message); setBusy(false); }
  };
  const withdraw = async () => {
    setBusy(true); setMessage("");
    try { await paymentAPI.connectPayout(Number(amount)); setAmount(""); await loadBalance(); setMessage("Withdrawal request created successfully."); } catch (e: any) { setMessage(e.message); }
    finally { setBusy(false); }
  };

  const available = balance?.balance?.available?.[0]?.amount ? Number(balance.balance.available[0].amount) / 100 : 0;

  return <div className="space-y-7 max-w-4xl">
    <div><h1 className="text-3xl sm:text-4xl font-extrabold text-[#091E42]">Settings</h1><p className="mt-2 text-slate-500">Manage notifications, privacy, and your service earnings.</p></div>
    {message && <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-[#003898]">{message}</div>}

    <section className="rounded-2xl border bg-white p-6 shadow-sm"><div className="flex items-center gap-3 mb-5"><Bell className="text-[#003898]"/><div><h2 className="text-xl font-bold">Notifications</h2><p className="text-sm text-slate-500">Booking and service alerts.</p></div></div><div className="space-y-3">{[['Email Notifications','Receive booking updates by email.',notifyEmail,setNotifyEmail],['SMS Notifications','Receive important updates by SMS.',notifySMS,setNotifySMS],['Booking Alerts','Get notified when new requests arrive.',notifyBookings,setNotifyBookings]].map(([a,b,v,f]: any)=><div key={a} className="flex items-center justify-between border-b py-3 last:border-0"><div><p className="font-semibold">{a}</p><p className="text-sm text-slate-500">{b}</p></div><Toggle value={v} onChange={f}/></div>)}</div></section>

    <section className="rounded-2xl border bg-white p-6 shadow-sm"><div className="flex items-center gap-3 mb-5"><ShieldCheck className="text-[#003898]"/><div><h2 className="text-xl font-bold">Privacy</h2><p className="text-sm text-slate-500">Control profile visibility.</p></div></div><div className="flex items-center justify-between"><div><p className="font-semibold">Profile Visibility</p><p className="text-sm text-slate-500">Allow clients to find your approved profile.</p></div><Toggle value={profileVisible} onChange={setProfileVisible}/></div></section>

    <section className="rounded-2xl border bg-white p-6 shadow-sm"><div className="flex items-center gap-3 mb-5"><WalletCards className="text-[#003898]"/><div><h2 className="text-xl font-bold">Stripe Connect earnings</h2><p className="text-sm text-slate-500">Connect your payout account and withdraw your available service earnings.</p></div></div>{!balance?.connected ? <button onClick={onboard} disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-[#003898] px-5 py-3 font-semibold text-white">{busy ? <Loader2 className="animate-spin" size={17}/> : <ExternalLink size={17}/>} Connect payout account</button> : <div className="space-y-5"><div className="rounded-xl bg-slate-50 border p-5"><p className="text-xs font-bold uppercase text-slate-400">Available balance</p><p className="mt-2 text-3xl font-extrabold text-[#003898]">LKR {available.toLocaleString()}</p></div><div className="flex flex-col sm:flex-row gap-3"><input value={amount} onChange={e=>setAmount(e.target.value)} type="number" min="1" placeholder="Withdrawal amount" className="flex-1 rounded-xl border px-4 py-3"/><button onClick={withdraw} disabled={busy || Number(amount)<=0} className="rounded-xl bg-[#003898] px-5 py-3 font-semibold text-white disabled:opacity-50">{busy ? "Processing..." : "Withdraw"}</button></div></div>}</section>

    <section className="rounded-2xl border bg-white p-6 shadow-sm"><div className="flex items-center gap-3 mb-5"><Lock className="text-[#003898]"/><div><h2 className="text-xl font-bold">Security</h2><p className="text-sm text-slate-500">Keep your account credentials secure.</p></div></div><div className="grid sm:grid-cols-3 gap-4"><input className="rounded-xl border px-4 py-3" placeholder="Current password" type="password"/><input className="rounded-xl border px-4 py-3" placeholder="New password" type="password"/><input className="rounded-xl border px-4 py-3" placeholder="Confirm password" type="password"/></div><button className="mt-4 rounded-xl border border-[#003898] px-5 py-3 font-semibold text-[#003898]">Update Password</button></section>
  </div>;
}

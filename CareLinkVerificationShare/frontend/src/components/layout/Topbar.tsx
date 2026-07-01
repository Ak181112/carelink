"use client";
import type { PageLabels } from "@/components/AdminDashboard";

interface TopbarProps {
  page: string;
  labels: PageLabels;
}

export default function Topbar({ page, labels }: TopbarProps) {
  const pageName = labels[page] ?? "Dashboard";
  return (
    <header className="fixed top-0 left-60 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-7 z-40">
      <div>
        <h2 className="text-base font-bold text-slate-900 leading-none">{pageName}</h2>
        <p className="text-xs text-slate-400 mt-0.5">CareLink+ Administration</p>
      </div>
      <div className="flex items-center gap-5">
        <button className="relative p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
          <span className="text-xl">🔔</span>
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">4</span>
        </button>
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: "#003898" }}>A</div>
          <div>
            <p className="text-sm font-semibold text-slate-800 leading-none">Admin</p>
            <p className="text-xs text-slate-400 mt-0.5">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}

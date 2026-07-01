"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { LogOut, Menu, X } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

interface Props {
  navItems: NavItem[];
  title: string;
  children: React.ReactNode;
}

export default function DashboardShell({ navItems, title, children }: Props) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initial = user?.name?.charAt(0).toUpperCase() ?? "?";
  const firstName = user?.name?.split(" ")[0] ?? "";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-[#091E42] text-white z-30 flex flex-col transform transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:sticky lg:top-0 lg:z-auto lg:shrink-0`}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10 shrink-0">
          <Link href="/" className="text-2xl font-bold text-white tracking-tight">
            CareLink+
          </Link>
          <p className="mt-0.5 text-xs text-white/40 uppercase tracking-widest">{title}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const segments = item.href.split("/").filter(Boolean);
            const isDashboardRoot = segments.length === 1;
            const isActive = isDashboardRoot
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all
                  ${isActive
                    ? "bg-[#0052CC] text-white shadow-lg shadow-blue-900/30"
                    : "text-white/60 hover:bg-white/8 hover:text-white"}`}
              >
                <span className="text-base w-5 text-center">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User footer in sidebar */}
        <div className="shrink-0 p-4 border-t border-white/10 bg-[#091E42]">
          <div className="flex items-center gap-3 px-1 mb-3">
            <div className="h-8 w-8 rounded-full bg-[#0052CC] flex items-center justify-center text-sm font-bold shrink-0">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate leading-tight">{user?.name}</p>
              <p className="text-xs text-white/40 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/8 py-2 text-sm text-white/60 hover:bg-red-500/20 hover:text-red-300 transition-all"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Top header */}
        <header className="bg-white border-b border-[#DFE1E6] px-4 lg:px-6 py-3.5 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition"
              onClick={() => setSidebarOpen((v) => !v)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <h1 className="text-base font-semibold text-[#091E42] hidden lg:block">{title}</h1>
          </div>

          {/* Right: name + round avatar + logout */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-sm text-[#42526E]">
              Welcome,{" "}
              <span className="font-semibold text-[#091E42]">{firstName}</span>
            </span>

            {/* Round avatar */}
            <div className="h-9 w-9 rounded-full bg-[#0052CC] flex items-center justify-center text-white text-sm font-bold select-none ring-2 ring-blue-200">
              {initial}
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              title="Logout"
              className="flex items-center gap-1.5 rounded-xl border border-transparent px-3 py-2 text-sm text-[#42526E] hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline font-medium">Logout</span>
            </button>
          </div>
        </header>

        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

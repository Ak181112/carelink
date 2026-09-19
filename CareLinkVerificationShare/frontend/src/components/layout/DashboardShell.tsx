"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState, type ReactNode } from "react";
import { LogOut, Menu, X } from "lucide-react";
import ThemeToggle from "@/components/common/ThemeToggle";

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

interface Props {
  navItems: NavItem[];
  title: string;
  children: React.ReactNode;
}

export default function DashboardShell({
  navItems,
  title,
  children,
}: Props) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initial = user?.name?.charAt(0).toUpperCase() ?? "?";
  const firstName = user?.name?.split(" ")[0] ?? "";

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] transition-colors duration-200 dark:bg-slate-950">
      {/* =========================================================
          MOBILE OVERLAY
      ========================================================== */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* =========================================================
          SIDEBAR
      ========================================================== */}
      <aside
        className={`
          fixed
          top-0
          left-0
          z-30
          flex
          h-screen
          w-64
          transform
          flex-col
          bg-[#091E42]
          text-white
          transition-transform
          duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:sticky
          lg:top-0
          lg:z-auto
          lg:shrink-0
          lg:translate-x-0
        `}
      >
        {/* =====================================================
            SIDEBAR LOGO
        ====================================================== */}
        <div className="shrink-0 border-b border-white/10 px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-white"
            onClick={() => setSidebarOpen(false)}
          >
            CareLink+
          </Link>

          <p className="mt-0.5 text-xs uppercase tracking-widest text-white/40">
            {title}
          </p>
        </div>

        {/* =====================================================
            NAVIGATION
        ====================================================== */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const segments = item.href
              .split("/")
              .filter(Boolean);

            const isDashboardRoot = segments.length === 1;

            const isActive = isDashboardRoot
              ? pathname === item.href
              : pathname === item.href ||
                pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  transition-all
                  ${
                    isActive
                      ? "bg-[#0052CC] text-white shadow-lg shadow-blue-900/30"
                      : "text-white/60 hover:bg-white/10 hover:text-white"
                  }
                `}
              >
                <span className="w-5 text-center text-base">
                  {item.icon}
                </span>

                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* =====================================================
            USER FOOTER
        ====================================================== */}
        <div className="shrink-0 border-t border-white/10 bg-[#091E42] p-4">
          <div className="mb-3 flex items-center gap-3 px-1">
            {/* Avatar */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0052CC] text-sm font-bold">
              {initial}
            </div>

            {/* User information */}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight text-white">
                {user?.name}
              </p>

              <p className="truncate text-xs text-white/40">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Sidebar Logout */}
          <button
            type="button"
            onClick={logout}
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-white/10
              py-2
              text-sm
              text-white/60
              transition-all
              hover:bg-red-500/20
              hover:text-red-300
            "
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* =========================================================
          MAIN CONTENT AREA
      ========================================================== */}
      <div className="min-w-0 flex-1">
        {/* =======================================================
            TOP HEADER
        ======================================================== */}
        <header
          className="
            sticky
            top-0
            z-10
            flex
            items-center
            justify-between
            border-b
            border-[#DFE1E6]
            bg-white
            px-4
            py-3.5
            shadow-sm
            transition-colors
            duration-200
            dark:border-slate-800
            dark:bg-slate-900
            lg:px-6
          "
        >
          {/* ===================================================
              LEFT SIDE
          ==================================================== */}
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              type="button"
              aria-label={
                sidebarOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={sidebarOpen}
              className="
                rounded-xl
                p-2
                text-gray-500
                transition
                hover:bg-gray-100
                dark:text-slate-300
                dark:hover:bg-slate-800
                lg:hidden
              "
              onClick={() =>
                setSidebarOpen((value) => !value)
              }
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            {/* Dashboard title */}
            <h1
              className="
                hidden
                text-base
                font-semibold
                text-[#091E42]
                dark:text-slate-100
                lg:block
              "
            >
              {title}
            </h1>
          </div>

          {/* ===================================================
              RIGHT SIDE
          ==================================================== */}
          <div className="flex items-center gap-2">
            {/* Dark / Light Mode */}
            <ThemeToggle compact />

            {/* Welcome text */}
            <span
              className="
                hidden
                text-sm
                text-[#42526E]
                dark:text-slate-300
                sm:block
              "
            >
              Welcome{" "}
              <span className="font-semibold text-[#091E42] dark:text-slate-100">
                {firstName}
              </span>
            </span>

            {/* Round avatar */}
            <div
              className="
                flex
                h-9
                w-9
                select-none
                items-center
                justify-center
                rounded-full
                bg-[#0052CC]
                text-sm
                font-bold
                text-white
                ring-2
                ring-blue-200
                dark:ring-blue-900
              "
              aria-label={`${user?.name ?? "User"} profile`}
            >
              {initial}
            </div>

            {/* Top Logout */}
            <button
              type="button"
              onClick={logout}
              title="Logout"
              aria-label="Logout"
              className="
                flex
                items-center
                gap-1.5
                rounded-xl
                border
                border-transparent
                px-3
                py-2
                text-sm
                text-[#42526E]
                transition
                hover:border-red-200
                hover:bg-red-50
                hover:text-red-600
                dark:text-slate-300
                dark:hover:border-red-900/50
                dark:hover:bg-red-950/30
                dark:hover:text-red-300
              "
            >
              <LogOut className="h-4 w-4" />

              <span className="hidden font-medium md:inline">
                Logout
              </span>
            </button>
          </div>
        </header>

        {/* =======================================================
            PAGE CONTENT
        ======================================================== */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
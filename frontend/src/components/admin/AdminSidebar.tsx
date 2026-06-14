"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/common/Logo";

import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  CalendarDays,
  CreditCard,
  BarChart3,
  MessageSquare,
  Bell,
  Settings,
  ShieldCheck,
  FileSearch,
  LogOut,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/admin",
    },

    {
      icon: Users,
      label: "User Management",
      href: "/admin/users",
    },

    {
      icon: ClipboardCheck,
      label: "Caretaker Applications",
      href: "/admin/caretaker-applications",
    },

    {
      icon: CalendarDays,
      label: "Bookings",
      href: "/admin/bookings",
    },

    {
      icon: CreditCard,
      label: "Payments",
      href: "/admin/payments",
    },

    {
      icon: BarChart3,
      label: "Reports & Analytics",
      href: "/admin/reports",
    },

    {
      icon: MessageSquare,
      label: "Feedback Monitoring",
      href: "/admin/feedback",
    },

    {
      icon: Bell,
      label: "Notifications",
      href: "/admin/notifications",
    },

    {
      icon: Settings,
      label: "System Settings",
      href: "/admin/settings",
    },

    {
      icon: ShieldCheck,
      label: "Role Management",
      href: "/admin/roles",
    },

    {
      icon: FileSearch,
      label: "Audit Logs",
      href: "/admin/audit-logs",
    },
  ];

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-slate-200 flex flex-col">

      {/* Logo */}
      <div className="px-4 py-4 border-b border-slate-200">
        <Logo />
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">

        {menuItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
              ${
                isActive
                  ? "bg-[#003898] text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <item.icon size={18} />

              <span>{item.label}</span>
            </Link>
          );
        })}

      </nav>

      {/* Logout */}
      <div className="border-t border-slate-200 p-4">

        <Link
  href="/login"
  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
>
  <LogOut size={18} />
  <span>Logout</span>
</Link>

      </div>

    </aside>
  );
}
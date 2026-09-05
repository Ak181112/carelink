"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { parentAPI, caretakerAPI, notificationAPI } from "@/services/api";
import { 
  Users, 
  Stethoscope, 
  Bell, 
  UserPlus, 
  Search, 
  User, 
  ArrowRight,
  Sparkles
} from "lucide-react";

export default function ClientDashboardPage() {
  const { user } = useAuth();
  const [parentCount, setParentCount] = useState(0);
  const [caretakerCount, setCaretakerCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      parentAPI.getAll().then((d) => setParentCount(d.profiles?.length || 0)).catch(() => {}),
      caretakerAPI.getApproved().then((d) => setCaretakerCount(d.caretakers?.length || 0)).catch(() => {}),
      notificationAPI.getAll().then((d) => setUnreadNotifications(d.unreadCount || 0)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const stats = [
    { 
      label: "Parent Profiles", 
      value: parentCount, 
      icon: Users, 
      href: "/client/parents", 
      colorClass: "bg-[#EEF4FF] text-[#003898]" 
    },
    { 
      label: "Available Caretakers", 
      value: caretakerCount, 
      icon: Stethoscope, 
      href: "/client/caretakers", 
      colorClass: "bg-green-100 text-green-600" 
    },
    { 
      label: "Unread Notifications", 
      value: unreadNotifications, 
      icon: Bell, 
      href: "/client/notifications", 
      colorClass: unreadNotifications > 0 ? "bg-amber-100 text-amber-600" : "bg-yellow-100 text-yellow-600" 
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-[#091E42]">
          Welcome back, <span className="text-[#003898]">{user?.name?.split(" ")[0] || "there"}</span>
        </h1>
        <p className="text-gray-500 mt-2">
          Manage your family&apos;s premium care needs from your central console.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Link 
              key={stat.label} 
              href={stat.href}
              className="group bg-white rounded-2xl border shadow-sm p-6 hover:shadow-lg transition block"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {stat.label}
                  </p>
                  <h2 className="text-3xl font-bold text-[#091E42] mt-2">
                    {loading ? (
                      <span className="inline-block w-12 h-8 animate-pulse bg-zinc-100 rounded-lg align-middle" />
                    ) : (
                      stat.value
                    )}
                  </h2>
                </div>
                <div className={`h-14 w-14 rounded-xl flex items-center justify-center shrink-0 ${stat.colorClass}`}>
                  <IconComponent size={28} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs font-semibold text-[#003898] opacity-0 transform -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                View details <ArrowRight className="ml-1 h-3 w-3" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <h2 className="text-2xl font-bold text-[#091E42] mb-6">
          Quick Actions
        </h2>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Add Parent Profile", href: "/client/parents?new=true", icon: UserPlus, desc: "Create a tailored profile" },
            { label: "Find Caretakers", href: "/client/caretakers", icon: Search, desc: "Browse vetted specialists" },
            { label: "My Profile", href: "/client/profile", icon: User, desc: "Update critical information" },
            { label: "Notifications", href: "/client/notifications", icon: Bell, desc: "View recent updates" },
          ].map((action) => {
            const ActionIcon = action.icon;
            return (
              <Link 
                key={action.label} 
                href={action.href}
                className="group relative rounded-xl border p-5 hover:border-[#003898] bg-zinc-50/20 hover:bg-white transition-all duration-300"
              >
                <div className="text-[#003898]">
                  <ActionIcon className="h-5 w-5 stroke-2" />
                </div>
                <p className="mt-4 font-bold text-[#003898] text-sm tracking-tight">{action.label}</p>
                <p className="text-xs text-zinc-500 mt-1 leading-normal group-hover:text-zinc-600 transition-colors duration-200">{action.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Flagship Brand Banner - Option B (Soft Premium Light Theme) */}
<div className="relative overflow-hidden rounded-2xl bg-[#EEF4FF]/60 border border-[#003898]/15 p-6 sm:p-8 shadow-sm">
  {/* Subtle Brand Background Glows */}
  <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#003898]/5 blur-[60px] pointer-events-none" />
  
  <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
    <div className="flex items-start gap-4">
      <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-[#003898]/20 shadow-xs">
        <Sparkles className="h-5 w-5 text-[#003898]" />
      </div>
      <div>
        <h3 className="font-bold text-lg tracking-tight text-[#091E42]">
          Find Elite Caretakers in Kurunegala
        </h3>
        <p className="mt-1 text-sm text-gray-500 max-w-xl leading-relaxed">
          Access our premium network of thoroughly verified healthcare professionals. Every caretaker is strictly screened and approved by our administrative team.
        </p>
      </div>
    </div>
    
    <Link 
      href="/client/caretaker-recommendation" 
      className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#003898] px-5 py-3 text-sm font-semibold text-white hover:bg-[#002D73] transition shadow-xs whitespace-nowrap"
    >
      Browse Directory
      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
    </Link>
  </div>
</div>
    </div>
  );
}
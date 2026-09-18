import AdminDashboardShell from "@/components/layout/AdminDashboardShell";

import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  CalendarDays,
  CreditCard,
  Mail,
  MessageSquare,
  Bell,
  Settings,
  Siren,
} from "lucide-react";

const adminNav = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard className="h-5 w-5 stroke-2" />,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: <Users className="h-5 w-5 stroke-2" />,
  },
  {
    label: "Applications",
    href: "/admin/applications",
    icon: <ClipboardCheck className="h-5 w-5 stroke-2" />,
  },
  {
    label: "Bookings",
    href: "/admin/bookings",
    icon: <CalendarDays className="h-5 w-5 stroke-2" />,
  },
  {
    label: "Payments",
    href: "/admin/payments",
    icon: <CreditCard className="h-5 w-5 stroke-2" />,
  },
  {
    label: "Contact Messages",
    href: "/admin/contact-messages",
    icon: <Mail className="h-5 w-5 stroke-2" />,
  },
  {
    label: "Feedback",
    href: "/admin/feedback",
    icon: <MessageSquare className="h-5 w-5 stroke-2" />,
  },
  {
    label: "Notifications",
    href: "/admin/notifications",
    icon: <Bell className="h-5 w-5 stroke-2" />,
  },
  {
    label: "System Settings",
    href: "/admin/settings",
    icon: <Settings className="h-5 w-5 stroke-2" />,
  },
  {
    label: "Emergency Alerts",
    href: "/admin/emergency",
    icon: <Siren className="h-5 w-5 stroke-2" />,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminDashboardShell
      navItems={adminNav}
      title="Admin Panel"
    >
      {children}
    </AdminDashboardShell>
  );
}
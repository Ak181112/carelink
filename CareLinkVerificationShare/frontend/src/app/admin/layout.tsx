import DashboardShell from "@/components/layout/DashboardShell";

const adminNav = [
  { label: "Dashboard", href: "/admin", icon: "📊" },
  { label: "Users", href: "/admin/users", icon: "👥" },
  { label: "Applications", href: "/admin/applications", icon: "📋" },
  { label: "Bookings", href: "/admin/bookings", icon: "📅" },
  { label: "Emergencies", href: "/admin/emergencies", icon: "🚨" },
  { label: "Payments", href: "/admin/payments", icon: "💳" },
  { label: "Reports", href: "/admin/reports", icon: "📊" },
  { label: "Contact Messages", href: "/admin/contact-messages", icon: "✉️" },
  { label: "Feedback", href: "/admin/feedback", icon: "💬" },
  { label: "Notifications", href: "/admin/notifications", icon: "🔔" },
  { label: "Roles", href: "/admin/roles", icon: "🛡️" },
  { label: "Help", href: "/admin/help", icon: "❓" },
  { label: "System Settings", href: "/admin/settings", icon: "⚙️" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell navItems={adminNav} title="Admin Panel">
      {children}
    </DashboardShell>
  );
}

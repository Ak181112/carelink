import DashboardShell from "@/components/layout/DashboardShell";

const clientNav = [
  { label: "Dashboard", href: "/client/dashboard", icon: "🏠" },
  { label: "My Profile", href: "/client/profile", icon: "👤" },
  { label: "Parent Profiles", href: "/client/parents", icon: "👴" },
  { label: "Find Caretakers", href: "/client/caretakers", icon: "🔍" },
  { label: "My Bookings", href: "/client/bookings", icon: "📅" },
  { label: "Notifications", href: "/client/notifications", icon: "🔔" },
  { label: "Settings", href: "/client/settings", icon: "⚙️" },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell navItems={clientNav} title="Family Member Dashboard">
      {children}
    </DashboardShell>
  );
}

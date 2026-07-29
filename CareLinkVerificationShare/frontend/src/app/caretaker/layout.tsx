import DashboardShell from "@/components/layout/DashboardShell";

const caretakerNav = [
  { label: "Dashboard", href: "/caretaker", icon: "🏠" },
  { label: "My Profile", href: "/caretaker/profile", icon: "👤" },
  { label: "Application", href: "/caretaker/application", icon: "📋" },
  { label: "My Bookings", href: "/caretaker/bookings", icon: "📅" },
  { label: "Notifications", href: "/caretaker/notifications", icon: "🔔" },
  { label: "Settings", href: "/caretaker/settings", icon: "⚙️" },
];

export default function CaretakerLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell navItems={caretakerNav} title="Caretaker Dashboard">
      {children}
    </DashboardShell>
  );
}

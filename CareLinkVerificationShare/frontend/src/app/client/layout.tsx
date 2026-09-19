
import DashboardShell from "@/components/layout/DashboardShell";
import {
  LayoutDashboard,
  User,
  Users,
  Search,
  CalendarDays,
  Bell,
  Settings,
} from "lucide-react";

const clientNav = [
  {
    label: "Dashboard",
    href: "/client/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: "My Profile",
    href: "/client/profile",
    icon: <User className="h-5 w-5" />,
  },
  {
    label: "Parent Profiles",
    href: "/client/parents",
    icon: <Users className="h-5 w-5" />,
  },
  {
    label: "Find Caretakers",
    href: "/client/caretaker-recommendation",
    icon: <Search className="h-5 w-5" />,
  },
  {
    label: "My Bookings",
    href: "/client/bookings",
    icon: <CalendarDays className="h-5 w-5" />,
  },
  {
    label: "Notifications",
    href: "/client/notifications",
    icon: <Bell className="h-5 w-5" />,
  },
  {
    label: "Settings",
    href: "/client/settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell
      navItems={clientNav}
      title="Family Member Dashboard"
    >
      {children}
    </DashboardShell>
  );
}
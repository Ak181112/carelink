import CaretakerDashboardShell from "@/components/layout/CaretakerDashboardShell";
import {
  LayoutDashboard,
  User,
  ClipboardCheck,
  CalendarDays,
  Bell,
  Settings,
} from "lucide-react";

const caretakerNav = [
  {
    label: "Dashboard",
    href: "/caretaker",
    icon: <LayoutDashboard className="h-5 w-5 stroke-2" />,
  },
  {
    label: "My Profile",
    href: "/caretaker/profile",
    icon: <User className="h-5 w-5 stroke-2" />,
  },
  {
    label: "Application",
    href: "/caretaker/application",
    icon: <ClipboardCheck className="h-5 w-5 stroke-2" />,
  },
  {
    label: "Bookings",
    href: "/caretaker/bookings",
    icon: <CalendarDays className="h-5 w-5 stroke-2" />,
  },
  {
    label: "Notifications",
    href: "/caretaker/notifications",
    icon: <Bell className="h-5 w-5 stroke-2" />,
  },
  {
    label: "Settings",
    href: "/caretaker/settings",
    icon: <Settings className="h-5 w-5 stroke-2" />,
  },
];

export default function CaretakerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CaretakerDashboardShell
      navItems={caretakerNav}
      title="Caretaker Dashboard"
    >
      {children}
    </CaretakerDashboardShell>
  );
}
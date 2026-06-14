import {
  Users,
  UserCheck,
  CalendarDays,
  Wallet,
} from "lucide-react";

import StatCard from "./StatCard";

export default function AdminStats() {
  return (
<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "24px",
  }}
>
      <StatCard
        title="Total Users"
        value="1,245"
        icon={Users}
      />

      <StatCard
        title="Caretakers"
        value="320"
        icon={UserCheck}
      />

      <StatCard
        title="Bookings"
        value="892"
        icon={CalendarDays}
      />

      <StatCard
        title="Revenue"
        value="LKR 450K"
        icon={Wallet}
      />

    </div>
  );
}
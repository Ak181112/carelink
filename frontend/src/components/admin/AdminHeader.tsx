import Link from "next/link";
import { Bell } from "lucide-react";

export default function AdminHeader() {
  const notificationCount = 3;

  return (
    <div className="flex items-center gap-6">

      {/* Notification Bell */}
      <Link
  href="/admin/notifications"
  className="relative inline-flex"
>
  <Bell
    size={28}
    className="text-slate-700 cursor-pointer"
  />

  <div
  style={{
    position: "absolute",
    top: "-8px",
    right: "-8px",
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    backgroundColor: "red",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    fontWeight: "bold",
  }}
>
  {notificationCount}
</div>

</Link>

      {/* Admin Avatar */}
      <div className="w-10 h-10 rounded-full bg-[#003898] text-white flex items-center justify-center font-bold text-lg">
        A
      </div>

    </div>
  );
}
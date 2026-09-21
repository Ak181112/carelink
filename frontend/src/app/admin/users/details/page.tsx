import { Suspense } from "react";
import UserDetails from "@/components/admin/UserDetails";

export default function Page() {
  return (
    <Suspense fallback={<p className="text-slate-500">Loading user details...</p>}>
      <UserDetails />
    </Suspense>
  );
}
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import AdminStats from "./AdminStats";
import AdminRecentBookings from "./AdminRecentBookings";

export default function AdminDashboard() {
  return (
    <div className="flex">

      <AdminSidebar />

      <div className="flex-1 bg-slate-100 min-h-screen">

        <main className="p-8">

          <div className="flex justify-between items-start mb-10">

            <div>

              <h1 className="text-5xl font-bold text-slate-900">
                Admin Dashboard
              </h1>

              <p className="text-slate-500 text-xl mt-2">
                Welcome back, Administrator
              </p>

            </div>

            <AdminHeader />

          </div>

          <AdminStats />

          <div className="mt-10">
            <AdminRecentBookings />
          </div>

        </main>

      </div>

    </div>
  );
}
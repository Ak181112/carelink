import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import Link from "next/link";
export default function BookingManagement() {
  return (
    <div className="flex">
      <AdminSidebar />

      <div className="flex-1 bg-slate-100 min-h-screen">
        <main className="p-8">

          {/* Header */}
          <div className="flex justify-between items-start mb-10">

            <div>
              <h1 className="text-5xl font-bold text-slate-900">
                Booking Management
              </h1>

              <p className="text-slate-500 text-xl mt-2">
                Manage and monitor all bookings
              </p>
            </div>

            <AdminHeader />

          </div>

          {/* Main Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">

            {/* Search + Filter */}
            <div className="flex justify-between items-center mb-8">

              <div className="flex items-center gap-4">

                <input
                  type="text"
                  placeholder="Search bookings..."
                  className="w-80 px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-200"
                />

                <select className="px-4 py-3 border border-slate-300 rounded-xl bg-white outline-none">
                  <option>All Status</option>
                  <option>Pending</option>
                  <option>Confirmed</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>

              </div>

            </div>

            {/* Booking Table */}
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>
                  <tr className="border-b">

                    <th className="text-left py-4 font-semibold">
                      Booking ID
                    </th>

                    <th className="text-left py-4 font-semibold">
                      Parent
                    </th>

                    <th className="text-left py-4 font-semibold">
                      Caretaker
                    </th>

                    <th className="text-left py-4 font-semibold">
                      Date
                    </th>

                    <th className="text-left py-4 font-semibold">
                      Status
                    </th>

                    <th className="text-left py-4 font-semibold">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody>

                  <tr className="border-b hover:bg-slate-50 transition">

                    <td className="py-5">BK001</td>

                    <td>Mrs. Fernando</td>

                    <td>Nimal Perera</td>

                    <td>12 Jun 2026</td>

                    <td>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                        Confirmed
                      </span>
                    </td>

                    <td>
                      <Link
  href="/admin/bookings/details"
  className="bg-blue-50 text-[#003898] px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition inline-block"
>
  View
</Link>
                    </td>

                  </tr>

                  <tr className="border-b hover:bg-slate-50 transition">

                    <td className="py-5">BK002</td>

                    <td>Mr. Silva</td>

                    <td>Saman Silva</td>

                    <td>13 Jun 2026</td>

                    <td>
                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                        Pending
                      </span>
                    </td>

                    <td>
                      <Link
                        href="/admin/bookings/details"
                        className="bg-blue-50 text-[#003898] px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition inline-block"
                      >
                        View
                      </Link>
                    </td>

                  </tr>

                  <tr className="hover:bg-slate-50 transition">

                    <td className="py-5">BK003</td>

                    <td>Mrs. Perera</td>

                    <td>Kumari Silva</td>

                    <td>10 Jun 2026</td>

                    <td>
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                        Cancelled
                      </span>
                    </td>

                    <td>
                      <Link
                        href="/admin/bookings/details"
                        className="bg-blue-50 text-[#003898] px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition inline-block"
                      >
                        View
                      </Link>
                    </td>

                  </tr>

                </tbody>

              </table>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
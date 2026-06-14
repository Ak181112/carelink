import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import Link from "next/link";

export default function FeedbackMonitoring() {
  return (
    <div className="flex">
      <AdminSidebar />

      <div className="flex-1 bg-slate-100 min-h-screen">
        <main className="p-8">

          {/* Header */}
          <div className="flex justify-between items-start mb-10">

            <div>
              <h1 className="text-5xl font-bold text-slate-900">
                Feedback Monitoring
              </h1>

              <p className="text-slate-500 text-xl mt-2">
                Monitor parent feedback and caretaker ratings
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
                  placeholder="Search feedback..."
                  className="w-80 px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-200"
                />

                <select className="px-4 py-3 border border-slate-300 rounded-xl bg-white outline-none">
                  <option>All Ratings</option>
                  <option>5 Stars</option>
                  <option>4 Stars</option>
                  <option>3 Stars</option>
                  <option>2 Stars</option>
                  <option>1 Star</option>
                </select>

              </div>

            </div>

            {/* Feedback Table */}
            <table className="w-full">

              <thead>
                <tr className="border-b">

                  <th className="text-left py-4 font-semibold">
                    Parent
                  </th>

                  <th className="text-left py-4 font-semibold">
                    Caretaker
                  </th>

                  <th className="text-left py-4 font-semibold">
                    Rating
                  </th>

                  <th className="text-left py-4 font-semibold">
                    Comment
                  </th>

                  <th className="text-left py-4 font-semibold">
                    Date
                  </th>

                  <th className="text-left py-4 font-semibold">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody>

                <tr className="border-b hover:bg-slate-50 transition">

                  <td className="py-5">
                    Mrs. Fernando
                  </td>

                  <td>
                    Nimal Perera
                  </td>

                  <td>
                    ⭐⭐⭐⭐⭐
                  </td>

                  <td>
                    Excellent service and very caring.
                  </td>

                  <td>
                    12 Jun 2026
                  </td>

                  <td>
                    <Link
                      href="/admin/feedback/details"
                      className="bg-blue-50 text-[#003898] px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition"
                    >
                      View
                    </Link>
                  </td>

                </tr>

                <tr className="border-b hover:bg-slate-50 transition">

                  <td className="py-5">
                    Mr. Silva
                  </td>

                  <td>
                    Saman Silva
                  </td>

                  <td>
                    ⭐⭐⭐⭐
                  </td>

                  <td>
                    Good caretaker and arrived on time.
                  </td>

                  <td>
                    11 Jun 2026
                  </td>

                  <td>
                    <Link
                      href="/admin/feedback/details"
                      className="bg-blue-50 text-[#003898] px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition"
                    >
                      View
                    </Link>
                  </td>

                </tr>

                <tr className="hover:bg-slate-50 transition">

                  <td className="py-5">
                    Mrs. Perera
                  </td>

                  <td>
                    Kumari Fernando
                  </td>

                  <td>
                    ⭐⭐⭐
                  </td>

                  <td>
                    Service was satisfactory.
                  </td>

                  <td>
                    09 Jun 2026
                  </td>

                  <td>
                    <Link
                      href="/admin/feedback/details"
                      className="bg-blue-50 text-[#003898] px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition"
                    >
                      View
                    </Link>
                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        </main>
      </div>
    </div>
  );
}
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AuditLogs() {
  return (
    <div className="flex">
      <AdminSidebar />

      <div className="flex-1 bg-slate-100 min-h-screen">
        <main className="p-8">

          {/* Header */}
          <div className="flex justify-between items-start mb-10">

            <div>
              <h1 className="text-5xl font-bold text-slate-900">
                Audit Logs
              </h1>

              <p className="text-slate-500 text-xl mt-2">
                Track system activities and user actions
              </p>
            </div>

            <AdminHeader />

          </div>

          {/* Main Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">

            {/* Search */}
            <div className="mb-8">

              <input
                type="text"
                placeholder="Search logs..."
                className="w-80 px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-200"
              />

            </div>

            {/* Logs Table */}
            <table className="w-full">

              <thead>

                <tr className="border-b">

                  <th className="text-left py-4 font-semibold">
                    User
                  </th>

                  <th className="text-left py-4 font-semibold">
                    Action
                  </th>

                  <th className="text-left py-4 font-semibold">
                    Module
                  </th>

                  <th className="text-left py-4 font-semibold">
                    Date & Time
                  </th>

                  <th className="text-left py-4 font-semibold">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                <tr className="border-b hover:bg-slate-50">

                  <td className="py-5">
                    Admin
                  </td>

                  <td>
                    Approved Caretaker
                  </td>

                  <td>
                    Verification
                  </td>

                  <td>
                    15 Jun 2026 - 10:30 AM
                  </td>

                  <td>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                      Success
                    </span>
                  </td>

                </tr>

                <tr className="border-b hover:bg-slate-50">

                  <td className="py-5">
                    Admin
                  </td>

                  <td>
                    Updated System Settings
                  </td>

                  <td>
                    Settings
                  </td>

                  <td>
                    15 Jun 2026 - 09:45 AM
                  </td>

                  <td>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                      Success
                    </span>
                  </td>

                </tr>

                <tr className="hover:bg-slate-50">

                  <td className="py-5">
                    Staff User
                  </td>

                  <td>
                    Deleted Notification
                  </td>

                  <td>
                    Notifications
                  </td>

                  <td>
                    14 Jun 2026 - 03:20 PM
                  </td>

                  <td>
                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                      Warning
                    </span>
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
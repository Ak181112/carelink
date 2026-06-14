import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import Link from "next/link";
export default function UserManagement() {
  return (
    <div className="flex">
      <AdminSidebar />

      <div className="flex-1 bg-slate-100 min-h-screen">
        <main className="p-8">

          {/* Header */}
          <div className="flex justify-between items-start mb-10">

            <div>
              <h1 className="text-5xl font-bold text-slate-900">
                User Management
              </h1>

              <p className="text-slate-500 text-xl mt-2">
                Manage all users in the system
              </p>
            </div>

            <AdminHeader />

          </div>

          {/* Main Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">

            {/* Search + Filter + Button */}
            <div className="flex justify-between items-center mb-8">

              <div className="flex items-center gap-4">

                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-80 px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-200"
                />

                <select className="px-4 py-3 border border-slate-300 rounded-xl bg-white outline-none">
                  <option>All Roles</option>
                  <option>Admin</option>
                  <option>Client</option>
                  <option>Caretaker</option>
                </select>

              </div>

              <button className="bg-[#003898] text-white px-6 py-3 rounded-xl hover:bg-blue-800 transition">
                Add User
              </button>

            </div>

            {/* Table */}
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="border-b">

                    <th className="text-left py-4 font-semibold">
                      Name
                    </th>

                    <th className="text-left py-4 font-semibold">
                      Email
                    </th>

                    <th className="text-left py-4 font-semibold">
                      Role
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

                  {/* User 1 */}
                  <tr className="border-b hover:bg-slate-50 transition">

                    <td className="py-5">
                      Kamal Perera
                    </td>

                    <td>
                      kamal@gmail.com
                    </td>

                    <td>
                      Client
                    </td>

                    <td>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                        Active
                      </span>
                    </td>

                    <td>
  <Link
    href="/admin/users/details"
    className="bg-blue-50 text-[#003898] px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition inline-block"
  >
    View
  </Link>
</td>

                  </tr>

                  {/* User 2 */}
                  <tr className="hover:bg-slate-50 transition">

                    <td className="py-5">
                      Nimal Fernando
                    </td>

                    <td>
                      nimal@gmail.com
                    </td>

                    <td>
                      Caretaker
                    </td>

                    <td>
                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                        Pending
                      </span>
                    </td>

                   <td>
  <Link
    href="/admin/users/details"
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
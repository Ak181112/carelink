import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function RoleManagement() {
  return (
    <div className="flex">
      <AdminSidebar />

      <div className="flex-1 bg-slate-100 min-h-screen">
        <main className="p-8">

          {/* Header */}
          <div className="flex justify-between items-start mb-10">

            <div>
              <h1 className="text-5xl font-bold text-slate-900">
                Role Management
              </h1>

              <p className="text-slate-500 text-xl mt-2">
                Manage user roles and permissions
              </p>
            </div>

            <AdminHeader />

          </div>

          {/* Main Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">

            <table className="w-full">

              <thead>

                <tr className="border-b">

                  <th className="text-left py-4 font-semibold">
                    Role
                  </th>

                  <th className="text-left py-4 font-semibold">
                    Description
                  </th>

                  <th className="text-left py-4 font-semibold">
                    Users
                  </th>

                  <th className="text-left py-4 font-semibold">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                <tr className="border-b hover:bg-slate-50">

                  <td className="py-5">
                    Administrator
                  </td>

                  <td>
                    Full system access
                  </td>

                  <td>
                    2
                  </td>

                  <td>
                    <button className="bg-blue-50 text-[#003898] px-4 py-2 rounded-lg hover:bg-blue-100">
                      Edit
                    </button>
                  </td>

                </tr>

                <tr className="border-b hover:bg-slate-50">

                  <td className="py-5">
                    Client
                  </td>

                  <td>
                    Book caretaker services
                  </td>

                  <td>
                    856
                  </td>

                  <td>
                    <button className="bg-blue-50 text-[#003898] px-4 py-2 rounded-lg hover:bg-blue-100">
                      Edit
                    </button>
                  </td>

                </tr>

                <tr className="hover:bg-slate-50">

                  <td className="py-5">
                    Caretaker
                  </td>

                  <td>
                    Manage assigned bookings
                  </td>

                  <td>
                    320
                  </td>

                  <td>
                    <button className="bg-blue-50 text-[#003898] px-4 py-2 rounded-lg hover:bg-blue-100">
                      Edit
                    </button>
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
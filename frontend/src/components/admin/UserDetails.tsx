import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function UserDetails() {
  return (
    <div className="flex">
      <AdminSidebar />

      <div className="flex-1 bg-slate-100 min-h-screen">
        <main className="p-8">

          <div className="flex justify-between items-start mb-10">

            <div>
              <h1 className="text-5xl font-bold text-slate-900">
                User Details
              </h1>

              <p className="text-slate-500 text-xl mt-2">
                View user information
              </p>
            </div>

            <AdminHeader />

          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">

            <div className="flex items-center gap-6 mb-8">

              <div className="w-24 h-24 rounded-full bg-[#003898] text-white flex items-center justify-center text-3xl font-bold">
                K
              </div>

              <div>
                <h2 className="text-3xl font-bold">
                  Kamal Perera
                </h2>

                <p className="text-slate-500">
                  Client
                </p>
              </div>

            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "24px",
              }}
            >

              <div>
                <p className="text-slate-500">Email</p>
                <p className="font-semibold">
                  kamal@gmail.com
                </p>
              </div>

              <div>
                <p className="text-slate-500">Phone</p>
                <p className="font-semibold">
                  0771234567
                </p>
              </div>

              <div>
                <p className="text-slate-500">Role</p>
                <p className="font-semibold">
                  Client
                </p>
              </div>

              <div>
                <p className="text-slate-500">Status</p>

                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                  Active
                </span>
              </div>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
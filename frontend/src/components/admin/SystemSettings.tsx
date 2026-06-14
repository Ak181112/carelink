import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function SystemSettings() {
  return (
    <div className="flex">
      <AdminSidebar />

      <div className="flex-1 bg-slate-100 min-h-screen">
        <main className="p-8">

          {/* Header */}
          <div className="flex justify-between items-start mb-10">

            <div>
              <h1 className="text-5xl font-bold text-slate-900">
                System Settings
              </h1>

              <p className="text-slate-500 text-xl mt-2">
                Configure platform settings and preferences
              </p>
            </div>

            <AdminHeader />

          </div>

          {/* Settings Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">

            <div className="space-y-6">

              <div>
                <label className="block font-medium mb-2">
                  Platform Name
                </label>

                <input
                  type="text"
                  defaultValue="CareLink+"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">
                  Support Email
                </label>

                <input
                  type="email"
                  defaultValue="support@carelink.com"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">
                  Contact Number
                </label>

                <input
                  type="text"
                  defaultValue="+94 77 123 4567"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">
                  Service Fee (%)
                </label>

                <input
                  type="number"
                  defaultValue="10"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl"
                />
              </div>

              <button className="bg-[#003898] text-white px-8 py-3 rounded-xl hover:bg-blue-800 transition">
                Save Settings
              </button>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
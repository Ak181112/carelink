import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function Notifications() {
  return (
    <div className="flex">
      <AdminSidebar />

      <div className="flex-1 bg-slate-100 min-h-screen">
        <main className="p-8">

          {/* Header */}
          <div className="flex justify-between items-start mb-10">

            <div>
              <h1 className="text-5xl font-bold text-slate-900">
                Notifications
              </h1>

              <p className="text-slate-500 text-xl mt-2">
                Manage platform notifications and alerts
              </p>
            </div>

            <AdminHeader />

          </div>

          {/* Main Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">

            {/* Top Actions */}
            <div className="flex justify-between items-center mb-8">

              <input
                type="text"
                placeholder="Search notifications..."
                className="w-80 px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-200"
              />

              <button className="bg-[#003898] text-white px-6 py-3 rounded-xl hover:bg-blue-800 transition">
                Create Notification
              </button>

            </div>

            {/* Notification List */}

            <div className="space-y-4">

              <div className="border border-slate-200 rounded-2xl p-5 flex justify-between items-center">

                <div>
                  <h3 className="font-semibold">
                    New Caretaker Application
                  </h3>

                  <p className="text-slate-500 text-sm mt-1">
                    Nimal Perera submitted a caretaker application.
                  </p>

                  <p className="text-slate-400 text-xs mt-2">
                    5 minutes ago
                  </p>
                </div>

                <button className="bg-blue-50 text-[#003898] px-4 py-2 rounded-lg hover:bg-blue-100">
                  Mark Read
                </button>

              </div>

              <div className="border border-slate-200 rounded-2xl p-5 flex justify-between items-center">

                <div>
                  <h3 className="font-semibold">
                    New Booking Created
                  </h3>

                  <p className="text-slate-500 text-sm mt-1">
                    Booking BK001 has been created.
                  </p>

                  <p className="text-slate-400 text-xs mt-2">
                    1 hour ago
                  </p>
                </div>

                <button className="bg-blue-50 text-[#003898] px-4 py-2 rounded-lg hover:bg-blue-100">
                  Mark Read
                </button>

              </div>

              <div className="border border-slate-200 rounded-2xl p-5 flex justify-between items-center">

                <div>
                  <h3 className="font-semibold">
                    Payment Received
                  </h3>

                  <p className="text-slate-500 text-sm mt-1">
                    Payment PAY001 successfully received.
                  </p>

                  <p className="text-slate-400 text-xs mt-2">
                    Yesterday
                  </p>
                </div>

                <button className="bg-blue-50 text-[#003898] px-4 py-2 rounded-lg hover:bg-blue-100">
                  Mark Read
                </button>

              </div>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
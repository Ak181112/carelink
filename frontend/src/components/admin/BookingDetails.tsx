import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function BookingDetails() {
  return (
    <div className="flex">
      <AdminSidebar />

      <div className="flex-1 bg-slate-100 min-h-screen">
        <main className="p-8">

          <div className="flex justify-between items-start mb-10">

            <div>
              <h1 className="text-5xl font-bold text-slate-900">
                Booking Details
              </h1>

              <p className="text-slate-500 text-xl mt-2">
                View booking information
              </p>
            </div>

            <AdminHeader />

          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">

            <h2 className="text-3xl font-bold mb-8">
              Booking BK001
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "24px",
              }}
            >

              <div>
                <p className="text-slate-500">Parent</p>
                <p className="font-semibold">
                  Mrs. Fernando
                </p>
              </div>

              <div>
                <p className="text-slate-500">Caretaker</p>
                <p className="font-semibold">
                  Nimal Perera
                </p>
              </div>

              <div>
                <p className="text-slate-500">Booking Date</p>
                <p className="font-semibold">
                  12 Jun 2026
                </p>
              </div>

              <div>
                <p className="text-slate-500">Duration</p>
                <p className="font-semibold">
                  4 Hours
                </p>
              </div>

              <div>
                <p className="text-slate-500">Location</p>
                <p className="font-semibold">
                  Colombo
                </p>
              </div>

              <div>
                <p className="text-slate-500">Status</p>

                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                  Confirmed
                </span>
              </div>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
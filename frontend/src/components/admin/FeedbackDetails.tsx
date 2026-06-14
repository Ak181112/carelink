import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function FeedbackDetails() {
  return (
    <div className="flex">
      <AdminSidebar />

      <div className="flex-1 bg-slate-100 min-h-screen">
        <main className="p-8">

          {/* Header */}
          <div className="flex justify-between items-start mb-10">

            <div>
              <h1 className="text-5xl font-bold text-slate-900">
                Feedback Details
              </h1>

              <p className="text-slate-500 text-xl mt-2">
                View customer feedback information
              </p>
            </div>

            <AdminHeader />

          </div>

          {/* Feedback Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">

            <h2 className="text-3xl font-bold mb-8">
              Feedback #FB001
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
                <p className="text-slate-500">Rating</p>
                <p className="font-semibold text-yellow-500">
                  ⭐⭐⭐⭐⭐
                </p>
              </div>

              <div>
                <p className="text-slate-500">Date</p>
                <p className="font-semibold">
                  12 Jun 2026
                </p>
              </div>

            </div>

            <div className="mt-8">

              <p className="text-slate-500 mb-2">
                Feedback Comment
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">

                <p>
                  Excellent service. The caretaker was punctual,
                  professional, and very caring towards my mother.
                  I would highly recommend this caretaker.
                </p>

              </div>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
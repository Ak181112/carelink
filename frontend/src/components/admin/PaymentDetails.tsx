import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function PaymentDetails() {
  return (
    <div className="flex">
      <AdminSidebar />

      <div className="flex-1 bg-slate-100 min-h-screen">
        <main className="p-8">

          <div className="flex justify-between items-start mb-10">

            <div>
              <h1 className="text-5xl font-bold text-slate-900">
                Payment Details
              </h1>

              <p className="text-slate-500 text-xl mt-2">
                View payment information
              </p>
            </div>

            <AdminHeader />

          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">

            <h2 className="text-3xl font-bold mb-8">
              Payment PAY001
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
                <p className="text-slate-500">Amount</p>
                <p className="font-semibold">
                  LKR 5,000
                </p>
              </div>

              <div>
                <p className="text-slate-500">Payment Method</p>
                <p className="font-semibold">
                  Visa Card
                </p>
              </div>

              <div>
                <p className="text-slate-500">Transaction ID</p>
                <p className="font-semibold">
                  TXN123456
                </p>
              </div>

              <div>
                <p className="text-slate-500">Payment Date</p>
                <p className="font-semibold">
                  15 Jun 2026
                </p>
              </div>

              <div>
                <p className="text-slate-500">Status</p>

                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                  Paid
                </span>
              </div>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
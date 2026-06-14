import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function ReportsAnalytics() {
  return (
    <div className="flex">
      <AdminSidebar />

      <div className="flex-1 bg-slate-100 min-h-screen">
        <main className="p-8">

          {/* Header */}
          <div className="flex justify-between items-start mb-10">

            <div>
              <h1 className="text-5xl font-bold text-slate-900">
                Reports & Analytics
              </h1>

              <p className="text-slate-500 text-xl mt-2">
                Monitor platform performance and statistics
              </p>
            </div>

            <AdminHeader />

          </div>

          {/* Statistics Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "24px",
              marginBottom: "32px",
            }}
          >

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <p className="text-slate-500">Total Revenue</p>
              <h3 className="text-4xl font-bold mt-3">
                LKR 450K
              </h3>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <p className="text-slate-500">Total Bookings</p>
              <h3 className="text-4xl font-bold mt-3">
                892
              </h3>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <p className="text-slate-500">Total Users</p>
              <h3 className="text-4xl font-bold mt-3">
                1,245
              </h3>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <p className="text-slate-500">Active Caretakers</p>
              <h3 className="text-4xl font-bold mt-3">
                320
              </h3>
            </div>

          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mb-8">

            <h2 className="text-2xl font-bold mb-8">
              Monthly Revenue
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

              <div>
                <p className="mb-2">January</p>
                <div
                  style={{
                    height: "16px",
                    width: "25%",
                    backgroundColor: "#003898",
                    borderRadius: "8px",
                  }}
                />
              </div>

              <div>
                <p className="mb-2">February</p>
                <div
                  style={{
                    height: "16px",
                    width: "40%",
                    backgroundColor: "#003898",
                    borderRadius: "8px",
                  }}
                />
              </div>

              <div>
                <p className="mb-2">March</p>
                <div
                  style={{
                    height: "16px",
                    width: "55%",
                    backgroundColor: "#003898",
                    borderRadius: "8px",
                  }}
                />
              </div>

              <div>
                <p className="mb-2">April</p>
                <div
                  style={{
                    height: "16px",
                    width: "70%",
                    backgroundColor: "#003898",
                    borderRadius: "8px",
                  }}
                />
              </div>

              <div>
                <p className="mb-2">May</p>
                <div
                  style={{
                    height: "16px",
                    width: "85%",
                    backgroundColor: "#003898",
                    borderRadius: "8px",
                  }}
                />
              </div>

              <div>
                <p className="mb-2">June</p>
                <div
                  style={{
                    height: "16px",
                    width: "100%",
                    backgroundColor: "#003898",
                    borderRadius: "8px",
                  }}
                />
              </div>

            </div>

          </div>

          {/* Summary */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">

            <h2 className="text-2xl font-bold mb-6">
              This Month Summary
            </h2>

            <table className="w-full">

              <tbody>

                <tr className="border-b">
                  <td className="py-4">Revenue</td>
                  <td className="font-semibold">LKR 75,000</td>
                </tr>

                <tr className="border-b">
                  <td className="py-4">Bookings</td>
                  <td className="font-semibold">125</td>
                </tr>

                <tr className="border-b">
                  <td className="py-4">New Users</td>
                  <td className="font-semibold">48</td>
                </tr>

                <tr>
                  <td className="py-4">New Caretakers</td>
                  <td className="font-semibold">12</td>
                </tr>

              </tbody>

            </table>

          </div>

        </main>
      </div>
    </div>
  );
}
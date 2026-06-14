import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function CaretakerVerification() {
  return (
    <div className="flex">
      <AdminSidebar />

      <div className="flex-1 bg-slate-100 min-h-screen">
        <main className="p-8">

          {/* Header */}
          <div className="flex justify-between items-start mb-10">

            <div>
              <h1 className="text-5xl font-bold text-slate-900">
                Caretaker Verification
              </h1>

              <p className="text-slate-500 text-xl mt-2">
                Review caretaker documents and approve applications
              </p>
            </div>

            <AdminHeader />

          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mb-8">

            <div className="flex items-center gap-6">

              <div className="w-28 h-28 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                Photo
              </div>

              <div>

                <h2 className="text-3xl font-bold">
                  Nimal Perera
                </h2>

                <p className="text-slate-500 mt-2">
                  Caretaker Applicant
                </p>

              </div>

            </div>

          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mb-8">

            <h3 className="text-2xl font-bold mb-6">
              Personal Information
            </h3>

            <div className="grid grid-cols-2 gap-6">

              <div>
                <p className="text-slate-500">NIC Number</p>
                <p className="font-semibold">200012345678</p>
              </div>

              <div>
                <p className="text-slate-500">Phone</p>
                <p className="font-semibold">077 123 4567</p>
              </div>

              <div>
                <p className="text-slate-500">Email</p>
                <p className="font-semibold">
                  nimal@gmail.com
                </p>
              </div>

              <div>
                <p className="text-slate-500">Experience</p>
                <p className="font-semibold">
                  3 Years
                </p>
              </div>

            </div>

          </div>

          {/* Documents */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mb-8">

            <h3 className="text-2xl font-bold mb-6">
              Uploaded Documents
            </h3>

            <div className="grid grid-cols-2 gap-6">

              <button className="border border-slate-300 rounded-xl p-5 text-left hover:bg-slate-50">
                NIC Front
              </button>

              <button className="border border-slate-300 rounded-xl p-5 text-left hover:bg-slate-50">
                NIC Back
              </button>

              <button className="border border-slate-300 rounded-xl p-5 text-left hover:bg-slate-50">
                Police Clearance Report
              </button>

              <button className="border border-slate-300 rounded-xl p-5 text-left hover:bg-slate-50">
                Medical Fitness Report
              </button>

              <button className="border border-slate-300 rounded-xl p-5 text-left hover:bg-slate-50">
                Caregiving Certificate
              </button>

            </div>

          </div>

          {/* Actions */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">

            <h3 className="text-2xl font-bold mb-6">
              Verification Decision
            </h3>

            <div className="flex gap-4">

              <button className="bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700">
                Approve
              </button>

              <button className="bg-red-600 text-white px-8 py-3 rounded-xl hover:bg-red-700">
                Reject
              </button>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
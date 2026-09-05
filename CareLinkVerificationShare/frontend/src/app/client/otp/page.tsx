import Link from "next/link";

export default function ClientOTPPage() {
  // Mock OTP representation array
  const otpDigits = ["4", "8", "2", "9", "1", "3"];

  return (
    <div className="min-h-screen bg-slate-50 antialiased text-slate-800">
      <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">

        {/* Header Block */}
        <div className="mb-8 border-b border-slate-200/60 pb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Caretaker Has Arrived
          </h1>
          <p className="text-slate-500 text-base sm:text-lg mt-1">
            Share the verification code below with your caretaker to securely begin the hospital visit.
          </p>
        </div>

        {/* Central Card Wrapper */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-10">
          <div className="text-center max-w-2xl mx-auto">
            
            {/* Visual Icon Badge */}
            <div className="w-16 h-16 rounded-full bg-blue-50 text-[#003898] flex items-center justify-center text-3xl mx-auto border border-blue-100 shadow-inner">
              🔐
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold mt-6 text-slate-900 tracking-tight">
              Your Verification Code
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-2">
              Read these numbers aloud to your caretaker so they can enter them into their device.
            </p>

            {/* Read-Only OTP Display */}
            <div className="flex justify-center gap-2 sm:gap-4 mt-8">
              {otpDigits.map((digit, idx) => (
                <div 
                  key={idx} 
                  className="w-12 h-16 sm:w-16 sm:h-20 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl sm:text-4xl font-extrabold text-slate-900 shadow-sm"
                >
                  {digit}
                </div>
              ))}
            </div>

            {/* Crucial System Policy Alert Box */}
            <div className="mt-8 bg-amber-50/70 border border-amber-100 rounded-xl p-4 text-left">
              <h3 className="font-bold text-sm text-amber-800 flex items-center gap-1.5 mb-1.5">
                ⚠️ Security Instructions
              </h3>
              <ul className="text-xs sm:text-sm text-slate-600 space-y-1 list-disc pl-5 leading-relaxed">
                <li>Verify that the person at your door is <strong className="text-slate-900">Nirmala Perera</strong> before sharing.</li>
                <li>This one-time passcode expires automatically once the tracking session initializes.</li>
              </ul>
            </div>

            {/* Split Information Section Grid */}
            <div className="grid md:grid-cols-2 gap-6 mt-10 text-left">
              
              {/* Booking Details Pane */}
              <div className="bg-slate-50 rounded-xl p-5 sm:p-6 border border-slate-100">
                <h3 className="text-base font-bold text-slate-900 mb-4 border-b border-slate-200/60 pb-2">
                  Booking Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Parent</span>
                    <span className="font-semibold text-slate-800">Nanda Perera</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Caretaker</span>
                    <span className="font-semibold text-slate-800">Nirmala Perera</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Hospital</span>
                    <span className="font-semibold text-slate-800 text-right truncate max-w-[160px]" title="Teaching Hospital Kurunegala">
                      Teaching Hospital...
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Appointment</span>
                    <span className="font-semibold text-slate-800">20 July 2026</span>
                  </div>
                </div>
              </div>

              {/* Troubleshooting Assistance Pane */}
              <div className="bg-slate-50 rounded-xl p-5 sm:p-6 border border-slate-100 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    Need Assistance?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-4">
                    If your caretaker hasn&apos;t arrived at the scheduled gate point yet, or if you encounter verification failures, check in directly.
                  </p>
                </div>
                <button 
                  type="button"
                  className="w-full bg-white border border-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-100 active:scale-[0.99] transition shadow-sm"
                >
                  Contact Caretaker
                </button>
              </div>

            </div>

            {/* Navigation Hub */}
            <div className="flex justify-center mt-10 border-t border-slate-100 pt-6">
              <Link 
                href="/client/dashboard" 
                className="w-full sm:w-auto border border-slate-200 text-slate-600 px-12 py-3.5 rounded-xl font-medium hover:bg-slate-50 hover:text-slate-800 active:scale-[0.99] transition text-sm text-center inline-block"
              >
                Back to Dashboard
              </Link>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
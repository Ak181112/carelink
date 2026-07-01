"use client";

export default function AdminFeedbackPage() {
  const sampleFeedback = [
    { id: 1, user: "Kamal Perera", role: "Family Member", caretaker: "Sunil Fernando", rating: 5, comment: "Excellent service! Very professional and caring.", date: "2024-01-15" },
    { id: 2, user: "Nimali Silva", role: "Family Member", caretaker: "Ranjith Kumara", rating: 4, comment: "Good caretaker, very punctual and experienced.", date: "2024-01-10" },
    { id: 3, user: "Chamara Bandara", role: "Family Member", caretaker: "Priyantha Dias", rating: 4, comment: "Helpful and caring. My parents are happy.", date: "2024-01-08" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#091E42]">Feedback Monitoring</h1>
        <p className="mt-1 text-[#42526E]">Monitor client reviews and caretaker ratings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {[
          { label: "Total Reviews", value: sampleFeedback.length, icon: "💬", color: "bg-blue-50 text-blue-600" },
          { label: "Average Rating", value: "4.3 ★", icon: "⭐", color: "bg-yellow-50 text-yellow-600" },
          { label: "5-Star Reviews", value: 1, icon: "🏆", color: "bg-green-50 text-green-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-[#DFE1E6]">
            <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${s.color} text-xl mb-3`}>{s.icon}</div>
            <p className="text-2xl font-bold text-[#091E42]">{s.value}</p>
            <p className="text-xs text-[#42526E] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#DFE1E6] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#DFE1E6]">
          <h2 className="font-bold text-[#091E42]">Recent Reviews (Sample Data)</h2>
          <p className="text-xs text-[#42526E] mt-1">Real reviews will appear here after booking system integration</p>
        </div>
        <div className="divide-y divide-[#DFE1E6]">
          {sampleFeedback.map((f) => (
            <div key={f.id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-[#091E42]">{f.user}</p>
                  <p className="text-xs text-[#42526E]">About: {f.caretaker}</p>
                </div>
                <div className="text-right">
                  <div className="text-yellow-500">{"★".repeat(f.rating)}{"☆".repeat(5 - f.rating)}</div>
                  <p className="text-xs text-[#6B7280] mt-1">{f.date}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-[#42526E]">"{f.comment}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

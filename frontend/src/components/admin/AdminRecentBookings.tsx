export default function AdminRecentBookings() {
  const bookings = [
    {
      id: "BK001",
      parent: "Mrs. Fernando",
      caretaker: "Nirmala Perera",
      date: "12 Jun 2026",
      status: "Pending",
    },
    {
      id: "BK002",
      parent: "Mr. Silva",
      caretaker: "Samanthi Silva",
      date: "11 Jun 2026",
      status: "Confirmed",
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">

        <h2 className="text-3xl font-bold">
          Recent Bookings
        </h2>

        <button className="text-[#003898] font-semibold hover:underline">
          View All →
        </button>

      </div>

      {/* Table */}
      <table className="w-full">

        <thead>
          <tr className="border-b">

            <th className="text-left py-4">
              Booking ID
            </th>

            <th className="text-left py-4">
              Parent
            </th>

            <th className="text-left py-4">
              Caretaker
            </th>

            <th className="text-left py-4">
              Date
            </th>

            <th className="text-left py-4">
              Status
            </th>

          </tr>
        </thead>

        <tbody>

          {bookings.map((booking) => (
            <tr
              key={booking.id}
              className="border-b hover:bg-slate-50 transition"
            >
              <td className="py-5">
                {booking.id}
              </td>

              <td>
                {booking.parent}
              </td>

              <td>
                {booking.caretaker}
              </td>

              <td>
                {booking.date}
              </td>

              <td>
  {booking.status === "Confirmed" ? (
    <span className="inline-flex px-4 py-2 rounded-full bg-green-200 text-green-800 text-sm font-semibold">
      Confirmed
    </span>
  ) : (
    <span className="inline-flex px-4 py-2 rounded-full bg-yellow-200 text-yellow-800 text-sm font-semibold">
      Pending
    </span>
  )}
</td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}
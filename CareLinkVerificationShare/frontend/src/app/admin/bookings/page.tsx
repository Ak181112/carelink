"use client";

import { useState } from "react";

interface Booking {
  id: string;
  parentName: string;
  caretakerName: string;
  serviceType: string;
  date: string;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
}

export default function BookingManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const bookings: Booking[] = [
    {
      id: "BK001",
      parentName: "John Silva",
      caretakerName: "Nimal Perera",
      serviceType: "Hospital Visit",
      date: "2026-06-20",
      status: "Pending",
    },
    {
      id: "BK002",
      parentName: "Mary Fernando",
      caretakerName: "Hospital Visit",
      serviceType: "Home Care",
      date: "2026-06-21",
      status: "Confirmed",
    },
    {
      id: "BK003",
      parentName: "Saman Kumara",
      caretakerName: "Dilani Perera",
      serviceType: "Hospital Visit",
      date: "2026-06-18",
      status: "Completed",
    },
    {
      id: "BK004",
      parentName: "Sunethra Silva",
      caretakerName: "Chathura Bandara",
      serviceType: "Hospital Visit",
      date: "2026-06-17",
      status: "Cancelled",
    },
  ];

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.parentName.toLowerCase().includes(search.toLowerCase()) ||
      booking.caretakerName.toLowerCase().includes(search.toLowerCase()) ||
      booking.id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      !statusFilter || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Pending: "bg-yellow-100 text-yellow-700",
      Confirmed: "bg-blue-100 text-blue-700",
      Completed: "bg-green-100 text-green-700",
      Cancelled: "bg-red-100 text-red-700",
    };

    return (
      <span
        className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#091E42]">
          Booking Management
        </h1>
        <p className="mt-1 text-[#42526E]">
          View and manage all bookings
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#DFE1E6] p-5 mb-6 flex flex-col sm:flex-row gap-4">
        <input
          placeholder="Search by booking ID, parent or caretaker..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 h-11 rounded-xl border border-[#DFE1E6] px-4 text-sm outline-none focus:border-[#0052CC]"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-11 rounded-xl border border-[#DFE1E6] px-4 text-sm outline-none focus:border-[#0052CC] sm:w-44"
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <button className="h-11 rounded-xl bg-[#0052CC] px-6 text-sm font-semibold text-white hover:bg-[#0747A6]">
          Search
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#DFE1E6] overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl">📅</span>
            <p className="mt-3 text-[#42526E]">
              No bookings found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFC] border-b border-[#DFE1E6]">
                <tr>
                  {[
                    "Booking ID",
                    "Parent",
                    "Caretaker",
                    "Service",
                    "Date",
                    "Status",
                    "Actions",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-5 py-3.5 text-left text-xs font-semibold text-[#42526E] uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#DFE1E6]">
                {filteredBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-[#F8FAFC] transition"
                  >
                    <td className="px-5 py-4 font-medium text-[#091E42]">
                      {booking.id}
                    </td>

                    <td className="px-5 py-4 text-[#42526E]">
                      {booking.parentName}
                    </td>

                    <td className="px-5 py-4 text-[#42526E]">
                      {booking.caretakerName}
                    </td>

                    <td className="px-5 py-4 text-[#42526E]">
                      {booking.serviceType}
                    </td>

                    <td className="px-5 py-4 text-[#42526E]">
                      {new Date(booking.date).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4">
                      {statusBadge(booking.status)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button className="rounded-lg border border-[#DFE1E6] px-3 py-1.5 text-xs font-medium text-[#091E42] hover:bg-gray-50">
                          View
                        </button>

                        <button className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
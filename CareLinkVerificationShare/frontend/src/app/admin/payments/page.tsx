"use client";

import { useState } from "react";

interface Payment {
  id: string;
  bookingId: string;
  familyMember: string;
  caretaker: string;
  amount: number;
  date: string;
  status: "Pending" | "Paid" | "Refunded";
}

export default function PaymentManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const payments: Payment[] = [
    {
      id: "PAY001",
      bookingId: "BK001",
      familyMember: "John Silva",
      caretaker: "Nimal Perera",
      amount: 4500,
      date: "2026-06-20",
      status: "Paid",
    },
    {
      id: "PAY002",
      bookingId: "BK002",
      familyMember: "Mary Fernando",
      caretaker: "Kasun Jayasinghe",
      amount: 3200,
      date: "2026-06-21",
      status: "Pending",
    },
    {
      id: "PAY003",
      bookingId: "BK003",
      familyMember: "Saman Kumara",
      caretaker: "Dilani Perera",
      amount: 5000,
      date: "2026-06-18",
      status: "Refunded",
    },
  ];

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.id.toLowerCase().includes(search.toLowerCase()) ||
      payment.bookingId.toLowerCase().includes(search.toLowerCase()) ||
      payment.familyMember.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      !statusFilter || payment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Paid: "bg-green-100 text-green-700",
      Pending: "bg-yellow-100 text-yellow-700",
      Refunded: "bg-red-100 text-red-700",
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
          Payment Management
        </h1>
        <p className="mt-1 text-[#42526E]">
          View and manage all payments
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#DFE1E6] p-5 mb-6 flex flex-col sm:flex-row gap-4">
        <input
          placeholder="Search by payment ID, booking ID or customer..."
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
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Refunded">Refunded</option>
        </select>

        <button className="h-11 rounded-xl bg-[#0052CC] px-6 text-sm font-semibold text-white hover:bg-[#0747A6]">
          Search
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#DFE1E6] overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl">💳</span>
            <p className="mt-3 text-[#42526E]">
              No payments found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFC] border-b border-[#DFE1E6]">
                <tr>
                  {[
                    "Payment ID",
                    "Booking ID",
                    "Family Member",
                    "Caretaker",
                    "Amount",
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
                {filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-[#F8FAFC] transition"
                  >
                    <td className="px-5 py-4 font-medium text-[#091E42]">
                      {payment.id}
                    </td>

                    <td className="px-5 py-4 text-[#42526E]">
                      {payment.bookingId}
                    </td>

                    <td className="px-5 py-4 text-[#42526E]">
                      {payment.familyMember}
                    </td>

                    <td className="px-5 py-4 text-[#42526E]">
                      {payment.caretaker}
                    </td>

                    <td className="px-5 py-4 font-semibold text-[#091E42]">
                      Rs. {payment.amount.toLocaleString()}
                    </td>

                    <td className="px-5 py-4 text-[#42526E]">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4">
                      {statusBadge(payment.status)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button className="rounded-lg border border-[#DFE1E6] px-3 py-1.5 text-xs font-medium text-[#091E42] hover:bg-gray-50">
                          View
                        </button>

                        <button className="rounded-lg border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50">
                          Receipt
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
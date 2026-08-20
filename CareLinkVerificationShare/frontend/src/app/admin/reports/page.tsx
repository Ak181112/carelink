"use client";

import { useCallback, useState } from "react";
import { adminAPI } from "@/services/api";
import { useApiData } from "@/lib/useApiData";
import { ReportData } from "@/types";
import { formatLkr } from "@/lib/bookingUtils";
import { STATUS_LABELS } from "@/lib/bookingUtils";
import ChartCard from "@/components/admin/ChartCard";
import ColumnChart from "@/components/admin/ColumnChart";
import BarList from "@/components/admin/BarList";

/**
 * Chart colours, validated with the dataviz palette checker against this app's
 * white card surface: blue↔orange scores CVD ΔE 29.1 and normal-vision ΔE 40.2,
 * clear of the 8 / 15 floors. The funnel uses an ordinal one-hue blue ramp
 * (monotone lightness, light end at 2.11:1).
 */
const SERIES_BOOKINGS = "#0052CC";
const SERIES_REVENUE = "#eb6834";
const FUNNEL_RAMP = ["#86b6ef", "#3987e5", "#1c5cab"];

const RANGES = [3, 6, 12];

const monthLabel = (key: string) => {
  const [year, month] = key.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-GB", { month: "short" });
};

const compactLkr = (value: number) =>
  value >= 1000 ? `${Math.round(value / 1000)}k` : String(value);

export default function AdminReportsPage() {
  const [months, setMonths] = useState(6);

  const fetchReports = useCallback(() => adminAPI.getReports(months), [months]);
  const { data, loading } = useApiData(fetchReports);

  const report: ReportData | null = data ?? null;
  const timeline = report?.timeline ?? [];
  const apps = report?.applications;

  const totalBookings = timeline.reduce((s, m) => s + m.bookings, 0);
  const totalCompleted = timeline.reduce((s, m) => s + m.completed, 0);
  const totalRevenue = timeline.reduce((s, m) => s + m.revenue, 0);
  const totalSignups = timeline.reduce((s, m) => s + m.newClients + m.newCaretakers, 0);

  const completionRate = totalBookings
    ? Math.round((totalCompleted / totalBookings) * 100)
    : 0;

  const statusRows = Object.entries(report?.bookingsByStatus ?? {})
    .map(([status, count]) => ({
      label: STATUS_LABELS[status as keyof typeof STATUS_LABELS] ?? status,
      value: count,
    }))
    .sort((a, b) => b.value - a.value);

  // An ordered funnel: every application, those whose NIC address matched, those approved.
  const funnelRows = apps
    ? [
        { label: "Submitted", value: apps.total },
        { label: "NIC address matched", value: apps.addressMatched },
        { label: "Approved", value: apps.approved },
      ]
    : [];

  const autoVerifyRate = apps?.total
    ? Math.round((apps.addressMatched / apps.total) * 100)
    : 0;

  const kpis = [
    { label: "Bookings", value: totalBookings, hint: `last ${months} months` },
    { label: "Completion rate", value: `${completionRate}%`, hint: `${totalCompleted} completed` },
    { label: "Revenue collected", value: formatLkr(totalRevenue), hint: "paid invoices only" },
    { label: "New sign-ups", value: totalSignups, hint: "clients + caretakers" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#091E42]">Reports &amp; Analytics</h1>
        <p className="mt-1 text-[#42526E]">
          How CareLink+ has been performing across the Kurunegala pilot.
        </p>
      </div>

      {/* One filter row above everything it scopes */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-sm text-[#42526E]">Period:</span>
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setMonths(r)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              months === r
                ? "bg-[#0052CC] text-white"
                : "border border-[#DFE1E6] bg-white text-[#42526E] hover:bg-gray-50"
            }`}
          >
            Last {r} months
          </button>
        ))}
      </div>

      {/* KPI row — headline numbers are figures, not one-bar charts */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-[#DFE1E6] bg-white p-5">
            <p className="text-sm text-[#42526E]">{k.label}</p>
            <p className="mt-1.5 text-3xl font-bold text-[#091E42]">
              {loading ? "—" : k.value}
            </p>
            <p className="mt-1 text-xs text-[#6B7280]">{k.hint}</p>
          </div>
        ))}
      </div>

      <div
        className={`space-y-6 transition-opacity ${loading ? "opacity-60" : "opacity-100"}`}
      >
        {/*
          Bookings and revenue are different measures on different scales, so they
          get their own charts and their own axes. Never one plot with two y-scales.
        */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard
            title="Bookings per month"
            subtitle="Every booking created, whatever its outcome"
            tableHead={["Month", "Bookings", "Completed", "Cancelled"]}
            tableRows={timeline.map((m) => [
              m.month,
              m.bookings,
              m.completed,
              m.cancelled,
            ])}
          >
            <ColumnChart
              data={timeline.map((m) => ({ label: monthLabel(m.month), value: m.bookings }))}
              color={SERIES_BOOKINGS}
            />
          </ChartCard>

          <ChartCard
            title="Revenue collected per month"
            subtitle="Only payments that actually settled"
            tableHead={["Month", "Revenue (LKR)", "Payments"]}
            tableRows={timeline.map((m) => [
              m.month,
              m.revenue.toLocaleString("en-LK"),
              m.payments,
            ])}
          >
            <ColumnChart
              data={timeline.map((m) => ({ label: monthLabel(m.month), value: m.revenue }))}
              color={SERIES_REVENUE}
              format={compactLkr}
            />
          </ChartCard>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard
            title="Bookings by status"
            subtitle="Where every booking currently sits"
          >
            <BarList data={statusRows} color={SERIES_BOOKINGS} />
          </ChartCard>

          <ChartCard
            title="Caretaker verification funnel"
            subtitle={`${autoVerifyRate}% of applications clear OCR without a manual check`}
          >
            <BarList data={funnelRows} color={SERIES_BOOKINGS} colors={FUNNEL_RAMP} />

            {apps && (
              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-[#F4F5F7] pt-4 text-center">
                {[
                  { label: "Awaiting review", value: apps.pending },
                  { label: "Manual overrides", value: apps.manualOverride },
                  { label: "OCR unreadable", value: apps.ocrFailed },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-xl font-bold tabular-nums text-[#091E42]">
                      {s.value}
                    </p>
                    <p className="mt-0.5 text-xs text-[#6B7280]">{s.label}</p>
                  </div>
                ))}
              </div>
            )}
          </ChartCard>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="Top caretakers" subtitle="By completed hospital visits">
            {report?.topCaretakers.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-[#DFE1E6]">
                    <tr>
                      {["Caretaker", "Visits", "Rating", "Earned"].map((h, i) => (
                        <th
                          key={h}
                          className={`py-2 text-xs font-semibold uppercase tracking-wider text-[#42526E] ${
                            i === 0 ? "text-left" : "text-right"
                          }`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4F5F7]">
                    {report.topCaretakers.map((c) => (
                      <tr key={c.name}>
                        <td className="py-2.5">
                          <span className="font-medium text-[#091E42]">{c.name}</span>
                          {c.town && (
                            <span className="ml-1.5 text-xs text-[#6B7280]">{c.town}</span>
                          )}
                        </td>
                        <td className="py-2.5 text-right tabular-nums text-[#091E42]">
                          {c.completedVisits}
                        </td>
                        <td className="py-2.5 text-right tabular-nums text-[#42526E]">
                          {c.averageRating ? `${c.averageRating.toFixed(1)} ★` : "—"}
                        </td>
                        <td className="py-2.5 text-right font-medium tabular-nums text-[#091E42]">
                          {formatLkr(c.earned)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-[#6B7280]">
                No completed visits yet
              </p>
            )}
          </ChartCard>

          <ChartCard title="Most requested hospitals" subtitle="Across all bookings">
            <BarList
              data={(report?.popularHospitals ?? []).map((h) => ({
                label: h.hospital,
                value: h.bookings,
              }))}
              color={SERIES_BOOKINGS}
            />
          </ChartCard>
        </div>

        <ChartCard
          title="New sign-ups per month"
          subtitle="Clients and caretakers joining the platform"
          tableHead={["Month", "Clients", "Caretakers"]}
          tableRows={timeline.map((m) => [m.month, m.newClients, m.newCaretakers])}
        >
          <ColumnChart
            data={timeline.map((m) => ({
              label: monthLabel(m.month),
              value: m.newClients + m.newCaretakers,
            }))}
            color={SERIES_BOOKINGS}
          />
        </ChartCard>
      </div>
    </div>
  );
}

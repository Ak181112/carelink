"use client";

import { ReactNode, useState } from "react";

/**
 * Chart chrome shared by the report cards.
 *
 * Every chart ships a table twin: values a chart only reveals on hover must
 * still be readable somewhere, so the toggle is part of the card rather than
 * something each chart re-invents.
 */
interface Props {
  title: string;
  subtitle?: string;
  /** Rendered when the card is in chart mode. */
  children: ReactNode;
  /** Column headings for the table twin. */
  tableHead?: string[];
  /** Row cells for the table twin, already formatted. */
  tableRows?: (string | number)[][];
  className?: string;
}

export default function ChartCard({
  title,
  subtitle,
  children,
  tableHead,
  tableRows,
  className = "",
}: Props) {
  const [showTable, setShowTable] = useState(false);
  const hasTable = Boolean(tableHead?.length && tableRows);

  return (
    <div
      className={`rounded-2xl border border-[#DFE1E6] bg-white p-6 ${className}`}
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#091E42]">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-[#6B7280]">{subtitle}</p>}
        </div>

        {hasTable && (
          <button
            onClick={() => setShowTable((v) => !v)}
            className="rounded-lg border border-[#DFE1E6] px-3 py-1.5 text-xs font-medium text-[#42526E] transition hover:border-[#0052CC] hover:text-[#0052CC]"
          >
            {showTable ? "View chart" : "View table"}
          </button>
        )}
      </div>

      {showTable && hasTable ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[#DFE1E6]">
              <tr>
                {tableHead!.map((h, i) => (
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
              {tableRows!.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td
                      key={c}
                      className={`py-2 tabular-nums ${
                        c === 0
                          ? "text-left text-[#42526E]"
                          : "text-right font-medium text-[#091E42]"
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

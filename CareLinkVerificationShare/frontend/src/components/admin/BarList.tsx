"use client";

/**
 * Horizontal bars for comparing magnitude across named categories.
 *
 * The categories here are nominal (statuses, hospitals), so every bar takes the
 * SAME hue: colouring darker-where-bigger would double-encode the bar length and
 * spend the only free channel on information the length already carries.
 * Values sit at the bar tip, so nothing is gated behind a tooltip.
 */
interface Props {
  data: { label: string; value: number }[];
  color: string;
  format?: (value: number) => string;
  /** Optional per-row ordinal colours, for genuinely ordered stages. */
  colors?: string[];
}

export default function BarList({
  data,
  color,
  format = (v) => v.toLocaleString("en-LK"),
  colors,
}: Props) {
  const max = Math.max(...data.map((d) => d.value), 1);

  if (data.length === 0) {
    return <p className="py-6 text-center text-sm text-[#6B7280]">No data yet</p>;
  }

  return (
    <div className="space-y-2.5">
      {data.map((d, i) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-32 shrink-0 truncate text-sm text-[#42526E]" title={d.label}>
            {d.label}
          </span>

          <div className="h-5 flex-1 overflow-hidden rounded-sm bg-[#F4F5F7]">
            <div
              className="h-full rounded-r-[4px] transition-[width] duration-300"
              style={{
                width: `${Math.max((d.value / max) * 100, d.value > 0 ? 1.5 : 0)}%`,
                backgroundColor: colors?.[i] ?? color,
              }}
            />
          </div>

          <span className="w-14 shrink-0 text-right text-sm font-medium tabular-nums text-[#091E42]">
            {format(d.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

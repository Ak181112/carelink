"use client";

/**
 * A single-series column chart in plain CSS.
 *
 * One series, so there is no legend — the card title names what is plotted.
 * Only the tallest column is direct-labelled; the y-axis ticks and the card's
 * table twin carry the rest, because a number on every column goes unread.
 */
interface Props {
  data: { label: string; value: number }[];
  /** Series colour. Validated against the white card surface. */
  color: string;
  /** Formats the direct label and the tooltip. */
  format?: (value: number) => string;
  height?: number;
}

// Rounds up to a clean tick value so the axis reads 0 / 20 / 40 rather than 0 / 17 / 34
const niceCeiling = (value: number) => {
  if (value <= 0) return 1;

  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalised = value / magnitude;
  const step = normalised <= 1 ? 1 : normalised <= 2 ? 2 : normalised <= 5 ? 5 : 10;

  return step * magnitude;
};

export default function ColumnChart({
  data,
  color,
  format = (v) => v.toLocaleString("en-LK"),
  height = 180,
}: Props) {
  const max = Math.max(...data.map((d) => d.value), 0);
  const ceiling = niceCeiling(max);
  const peakIndex = data.findIndex((d) => d.value === max && max > 0);

  const ticks = [ceiling, ceiling / 2, 0];

  return (
    // pt-6 reserves headroom for the peak label so it is never clipped by the
    // card, and shifts the tick column with the plot so the two stay aligned
    <div className="flex gap-3 pt-6">
      {/* y-axis ticks carry the values that are not direct-labelled */}
      <div
        className="flex w-12 shrink-0 flex-col justify-between text-right text-xs tabular-nums text-[#6B7280]"
        style={{ height }}
        aria-hidden
      >
        {ticks.map((t) => (
          <span key={t}>{format(t)}</span>
        ))}
      </div>

      <div className="min-w-0 flex-1">
        <div className="relative" style={{ height }}>
          {/* hairline gridlines, solid, one step off the surface */}
          {[0, 50, 100].map((pct) => (
            <div
              key={pct}
              className="absolute inset-x-0 border-t border-[#EBECF0]"
              style={{ top: `${pct}%` }}
              aria-hidden
            />
          ))}

          {/* 2px gap between adjacent columns; white does the separating */}
          <div className="absolute inset-0 flex items-end gap-0.5">
            {data.map((d, i) => {
              const pct = ceiling > 0 ? (d.value / ceiling) * 100 : 0;

              return (
                <div
                  key={d.label}
                  className="group relative flex flex-1 justify-center"
                  style={{ height: "100%" }}
                >
                  <div className="flex h-full w-full max-w-6 items-end">
                    <div
                      className="w-full rounded-t-xs transition-[height] duration-300"
                      style={{
                        height: `${Math.max(pct, d.value > 0 ? 2 : 0)}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>

                  {/* direct-label the peak only — the axis carries the rest */}
                  {i === peakIndex && (
                    <span
                      className="pointer-events-none absolute whitespace-nowrap text-xs font-semibold tabular-nums text-[#091E42]"
                      style={{ bottom: `calc(${Math.max(pct, 2)}% + 4px)` }}
                    >
                      {format(d.value)}
                    </span>
                  )}

                  {/* hover layer — the hit target is the full column slot */}
                  <div
                    className="absolute inset-0 cursor-default"
                    tabIndex={0}
                    role="img"
                    aria-label={`${d.label}: ${format(d.value)}`}
                  />
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#091E42] px-2.5 py-1.5 text-xs text-white opacity-0 shadow-lg transition group-focus-within:opacity-100 group-hover:opacity-100">
                    <span className="font-semibold">{format(d.value)}</span>
                    <span className="ml-1.5 text-white/70">{d.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* baseline */}
          <div className="absolute inset-x-0 bottom-0 border-t border-[#DFE1E6]" aria-hidden />
        </div>

        {/* x-axis band sits inside the card, so nothing gets its own scrollbar */}
        <div className="mt-2 flex gap-0.5">
          {data.map((d) => (
            <span
              key={d.label}
              className="flex-1 text-center text-[11px] text-[#6B7280]"
            >
              {d.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

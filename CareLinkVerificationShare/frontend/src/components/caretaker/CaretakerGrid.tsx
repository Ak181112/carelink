import CaretakerCard from "./CaretakerCard";
import { CaretakerProfile } from "@/types";

interface Props {
  caretakers: (CaretakerProfile & { pricePerHour?: number })[];
  loading: boolean;
}

function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-slate-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-slate-200" />
          <div className="h-3 w-1/2 rounded bg-slate-200" />
        </div>
      </div>
      <div className="mt-4 h-6 w-28 rounded-full bg-slate-200" />
      <div className="mt-4 flex justify-between">
        <div className="h-4 w-16 rounded bg-slate-200" />
        <div className="h-4 w-24 rounded bg-slate-200" />
      </div>
      <div className="mt-5 h-11 rounded-xl bg-slate-200" />
    </div>
  );
}

export default function CaretakerGrid({ caretakers, loading }: Props) {
  if (loading) {
    return (
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <SkeletonCard key={n} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!caretakers.length) {
    return (
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <span className="text-2xl">🔍</span>
          </div>
          <p className="text-lg font-medium text-slate-700">No caretakers found</p>
          <p className="mt-1 text-sm text-gray-400">Try adjusting your filters.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-6">
        <p className="mb-6 text-sm text-gray-500">
          {caretakers.length} caretaker{caretakers.length !== 1 ? "s" : ""} found
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {caretakers.map((caretaker) => (
            <CaretakerCard key={caretaker._id} caretaker={caretaker} />
          ))}
        </div>
      </div>
    </section>
  );
}

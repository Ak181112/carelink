"use client";

import { Search, MapPin, Clock } from "lucide-react";

interface SearchSectionProps {
  availability: string;
  location: string;
  locations: string[];
  onAvailabilityChange: (v: string) => void;
  onLocationChange: (v: string) => void;
  onSearch: () => void;
}

export default function SearchSection({
  availability,
  location,
  locations,
  onAvailabilityChange,
  onLocationChange,
  onSearch,
}: SearchSectionProps) {
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-4xl font-bold text-slate-900">Find Trusted Caretakers</h1>
        <p className="mt-2 text-gray-500">
          Search verified caregivers across Kurunegala district.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          {/* Availability */}
          <div className="relative flex-1">
            <Clock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              value={availability}
              onChange={(e) => onAvailabilityChange(e.target.value)}
              className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-3.5 pl-10 pr-4 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Availability</option>
              <option value="today">Available Today</option>
              <option value="week">Available This Week</option>
            </select>
          </div>

          {/* Location */}
          <div className="relative flex-1">
            <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-3.5 pl-10 pr-4 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <button
            onClick={onSearch}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 font-semibold text-white transition hover:bg-blue-700 active:bg-blue-800"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
        </div>
      </div>
    </section>
  );
}

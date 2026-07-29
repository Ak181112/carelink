"use client";

import { useState, useCallback, useMemo } from "react";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import Image from "next/image";
import Link from "next/link";
import { Search, MapPin, Briefcase, Star, Clock } from "lucide-react";
import { caretakerAPI } from "@/services/api";
import { useApiData } from "@/lib/useApiData";
import { CaretakerProfile } from "@/types";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace("/api", "");

const KURUNEGALA_TOWNS = [
  "Kurunegala", "Kuliyapitiya", "Nikaweratiya", "Maho", "Pannala", "Ibbagamuwa",
  "Giriulla", "Narammala", "Alawwa", "Polgahawela", "Wariyapola", "Melsiripura",
  "Polpithigama", "Ganewatta", "Bingiriya",
];

function getImageUrl(photo?: string) {
  if (!photo) return null;
  if (photo.startsWith("http")) return photo;
  return `${API_BASE}${photo}`;
}

export default function FindCaretakersPage() {
  const [search, setSearch] = useState("");
  const [town, setTown] = useState("");
  const [availability, setAvailability] = useState("");
  const [skill, setSkill] = useState("");

  const fetchCaretakers = useCallback(
    () => caretakerAPI.getApproved(town ? { town } : undefined),
    [town],
  );

  const { data, loading, reload } = useApiData(fetchCaretakers);
  const caretakers: CaretakerProfile[] = useMemo(
    () => data?.caretakers ?? [],
    [data],
  );

  const allSkills = useMemo(
    () => Array.from(new Set(caretakers.flatMap((c) => c.skills || []))).sort(),
    [caretakers]
  );

  const filtered = caretakers.filter((c) => {
    const matchesSearch =
      !search ||
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.skills?.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const matchesAvailability = !availability || c.isAvailable;
    const matchesSkill = !skill || c.skills?.includes(skill);
    return matchesSearch && matchesAvailability && matchesSkill;
  });

  const avgRating = caretakers.length
    ? caretakers.reduce((sum, c) => sum + (c.averageRating || 0), 0) / caretakers.length
    : 0;

  return (
    <>
      <Navbar />

      <main className="bg-[#F7F9FC] min-h-screen pb-24">

        {/* ================= HERO ================= */}

        <section className="relative overflow-hidden bg-linear-to-br from-[#EAF4FF] via-white to-[#F7FBFF]">
          <div className="absolute inset-0">
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-blue-100 blur-3xl opacity-60"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-cyan-100 blur-3xl opacity-50"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-6 py-20">
            <div className="grid lg:grid-cols-2 gap-14 items-center">

              {/* LEFT */}
              <div>
                <span className="inline-flex items-center rounded-full bg-blue-100 text-[#003898] font-semibold text-sm px-4 py-2 mb-6">
                  ✓ Verified Care Professionals
                </span>

                <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight">
                  Find the perfect
                  <span className="block text-[#003898]">
                    caretaker for your loved one
                  </span>
                </h1>

                <p className="mt-6 text-lg leading-8 text-slate-600 max-w-xl">
                  Browse trusted, background-verified caretakers based on
                  location, experience, availability and skills.
                  Compassionate care starts here.
                </p>

                <div className="flex flex-wrap gap-6 mt-10">
                  <div>
                    <h3 className="text-3xl font-bold text-slate-900">
                      {loading ? "—" : caretakers.length}
                    </h3>
                    <p className="text-slate-500">Verified Caretakers</p>
                  </div>

                  <div>
                    <h3 className="text-3xl font-bold text-slate-900">
                      {loading || !avgRating ? "—" : `${avgRating.toFixed(1)}★`}
                    </h3>
                    <p className="text-slate-500">Average Rating</p>
                  </div>

                  <div>
                    <h3 className="text-3xl font-bold text-slate-900">24/7</h3>
                    <p className="text-slate-500">Emergency Support</p>
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="hidden lg:flex justify-end">
                <div className="relative">
                  <div className="absolute inset-0 rounded-[40px] bg-[#003898]/10 blur-2xl"></div>
                  <Image
                    src="/images/hero-caregiver.png"
                    alt="Caretaker"
                    width={560}
                    height={560}
                    className="relative rounded-[40px] shadow-2xl object-cover"
                  />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ================= SEARCH ================= */}

        <section className="-mt-10 relative z-20 max-w-7xl mx-auto px-6 mb-16">
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Search Caretakers</h2>
                <p className="text-slate-500 mt-1">Filter by skills, location and availability.</p>
              </div>

              <div className="hidden lg:flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-semibold text-[#003898]">
                  {caretakers.length} approved caretaker{caretakers.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <div className="grid lg:grid-cols-[2fr_1fr_1fr_auto] gap-5">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  placeholder="Search by caretaker name or skill..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-14 rounded-2xl border border-slate-200 bg-slate-50 pl-14 pr-4 focus:bg-white focus:border-[#003898] outline-none transition"
                />
              </div>

              <select
                value={town}
                onChange={(e) => setTown(e.target.value)}
                className="h-14 rounded-2xl border border-slate-200 bg-slate-50 px-4"
              >
                <option value="">All Locations</option>
                {KURUNEGALA_TOWNS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="h-14 rounded-2xl border border-slate-200 bg-slate-50 px-4"
              >
                <option value="">Availability</option>
                <option value="available">Available Now</option>
              </select>

              <button
                onClick={reload}
                className="h-14 px-8 rounded-2xl bg-[#003898] hover:bg-[#002E7A] text-white font-semibold transition"
              >
                Search
              </button>
            </div>

            {allSkills.length > 0 && (
              <div className="grid md:grid-cols-1 gap-6 mt-8 pt-8 border-t">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">
                    Skills
                  </label>
                  <select
                    value={skill}
                    onChange={(e) => setSkill(e.target.value)}
                    className="w-full h-12 rounded-xl border border-slate-200 px-4"
                  >
                    <option value="">All Skills</option>
                    {allSkills.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* --- CARETAKER CARD GRID --- */}
        <section className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-3xl border border-slate-100 p-6 animate-pulse">
                  <div className="h-40 rounded-2xl bg-slate-100" />
                  <div className="mt-4 h-4 w-2/3 rounded bg-slate-100" />
                  <div className="mt-2 h-3 w-1/3 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center">
              <span className="text-5xl">🔍</span>
              <h3 className="mt-4 text-xl font-bold text-slate-900">No caretakers found</h3>
              <p className="mt-2 text-slate-500">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((caretaker) => {
                const imageUrl = getImageUrl(caretaker.photo);
                return (
                  <div
                    key={caretaker._id}
                    className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs flex flex-col justify-between"
                  >
                    {/* Photo + Status Pills */}
                    <div className="relative w-full aspect-4/3 bg-slate-100">
                      {imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- external backend-served upload, not whitelisted for next/image
                        <img src={imageUrl} alt={caretaker.fullName} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-blue-300">
                          {caretaker.fullName?.charAt(0) ?? "?"}
                        </div>
                      )}

                      <span
                        className={`absolute top-4 left-4 text-[11px] font-bold px-3 py-1.5 rounded-full text-white shadow-xs flex items-center gap-1.5 ${
                          caretaker.isAvailable ? "bg-emerald-600" : "bg-slate-500"
                        }`}
                      >
                        <Clock className="h-3 w-3" />
                        {caretaker.isAvailable ? "Available now" : "Unavailable"}
                      </span>

                      <span className="absolute top-4 right-4 bg-white/95 backdrop-blur-xs text-slate-950 font-bold text-xs px-2.5 py-1.5 rounded-full flex items-center gap-1 shadow-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {caretaker.averageRating > 0 ? caretaker.averageRating.toFixed(1) : "New"}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{caretaker.fullName}</h3>

                        <div className="flex flex-wrap items-center gap-4 text-slate-400 text-xs font-medium mt-2">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-300" />
                            {caretaker.town || caretaker.district}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5 text-slate-300" />
                            {caretaker.experience}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-4">
                          {(caretaker.skills || []).slice(0, 4).map((tagItem) => (
                            <span
                              key={tagItem}
                              className="text-[11px] font-semibold bg-blue-50/70 text-[#003898] px-2.5 py-1 rounded-md"
                            >
                              {tagItem}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                          {caretaker.reviews?.length || 0} review{(caretaker.reviews?.length || 0) !== 1 ? "s" : ""}
                        </span>

                        <Link
                          href={`/find-caretakers/${caretaker._id}`}
                          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>

      <Footer />
    </>
  );
}

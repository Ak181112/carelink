import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import Image from "next/image";
import Link from "next/link";
import { Search, MapPin, Briefcase, Languages, Star, SlidersHorizontal } from "lucide-react";

export default function FindCaretakersPage() {
  // Mock data representing the 6 caretakers shown in preview--cheerful-content-tune.lovable.app_contact (1).jpg
  const caretakers = [
    {
      id: 1,
      name: "Priya Fernando",
      image: "/images/caretaker1.png",
      location: "Kuliyapitiya",
      exp: "7 y exp",
      rating: "4.9",
      availability: "Available now",
      availabilityType: "now", // green pill
      tags: ["Elderly Care", "Hospital Visits", "Medication"],
      languages: "English · Sinhala · Tamil",
      price: "LKR 1,500",
    },
    {
      id: 2,
      name: "Nimal Bandara",
      image: "/images/caretaker2.png",
      location: "Wariyapola",
      exp: "5 y exp",
      rating: "4.8",
      availability: "Available this week",
      availabilityType: "week", // blue pill
      tags: ["Physiotherapy Support", "Elderly Care", "Companionship"],
      languages: "Sinhala · English",
      price: "LKR 1,300",
    },
    {
      id: 3,
      name: "Saman Perera",
      image: "/images/caretaker3.png",
      location: "Hettipola",
      exp: "4 y exp",
      rating: "4.7",
      availability: "Weekends only",
      availabilityType: "weekends", // dark blue/gray pill
      tags: ["Companionship", "Cooking", "Light Housekeeping"],
      languages: "Sinhala · English",
      price: "LKR 1,200",
    },
    {
      id: 4,
      name: "Ayesha Rahman",
      image: "/images/caretaker4.png",
      location: "Kurunegala",
      exp: "9 y exp",
      rating: "5.0",
      availability: "Available now",
      availabilityType: "now",
      tags: ["Dementia Care", "Elderly Care", "Medication"],
      languages: "English · Tamil · Sinhala",
      price: "LKR 1,800",
    },
    {
      id: 5,
      name: "Kasun De Silva",
      image: "/images/caretaker5.png",
      location: "Ibbagamuwa",
      exp: "3 y exp",
      rating: "4.6",
      availability: "Available this week",
      availabilityType: "week",
      tags: ["Hospital Visits", "Transport", "Companionship"],
      languages: "Sinhala · English",
      price: "LKR 1,100",
    },
    {
      id: 6,
      name: "Malini Jayawardena",
      image: "/images/caretaker6.png",
      location: "Matara",
      exp: "6 y exp",
      rating: "4.9",
      availability: "Available now",
      availabilityType: "now",
      tags: ["Elderly Care", "Cooking", "Medication"],
      languages: "Sinhala · English · Tamil",
      price: "LKR 1,400",
    },
  ];

  return (
    <>
      <Navbar />
      
      <main className="bg-[#F7F9FC] min-h-screen pb-24">
        
       {/* ================= HERO ================= */}

<section className="relative overflow-hidden bg-gradient-to-br from-[#EAF4FF] via-white to-[#F7FBFF]">
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

              300+

            </h3>

            <p className="text-slate-500">

              Verified Caretakers

            </p>

          </div>

          <div>

            <h3 className="text-3xl font-bold text-slate-900">

              4.9★

            </h3>

            <p className="text-slate-500">

              Average Rating

            </p>

          </div>

          <div>

            <h3 className="text-3xl font-bold text-slate-900">

              24/7

            </h3>

            <p className="text-slate-500">

              Emergency Support

            </p>

          </div>

        </div>

      </div>

      {/* RIGHT */}

      <div className="hidden lg:flex justify-end">

        <div className="relative">

          <div className="absolute inset-0 rounded-[40px] bg-[#003898]/10 blur-2xl"></div>

          <Image
            src="/images/caretaker-hero.png"
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

        <h2 className="text-2xl font-bold text-slate-900">

          Search Caretakers

        </h2>

        <p className="text-slate-500 mt-1">

          Filter by skills, location and availability.

        </p>

      </div>

      <div className="hidden lg:flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">

        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400"/>

        <span className="text-sm font-semibold text-[#003898]">

          Trusted by 1,000+ Families

        </span>

      </div>

    </div>

    <div className="grid lg:grid-cols-[2fr_1fr_1fr_auto] gap-5">

      <div className="relative">

        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5"/>

        <input

          placeholder="Search by caretaker name or skill..."

          className="w-full h-14 rounded-2xl border border-slate-200 bg-slate-50 pl-14 pr-4 focus:bg-white focus:border-[#003898] outline-none transition"

        />

      </div>

      <select className="h-14 rounded-2xl border border-slate-200 bg-slate-50 px-4">

        <option>All Locations</option>

      </select>

      <select className="h-14 rounded-2xl border border-slate-200 bg-slate-50 px-4">

        <option>Availability</option>

      </select>

      <button className="h-14 px-8 rounded-2xl bg-[#003898] hover:bg-[#002E7A] text-white font-semibold transition">

        Search

      </button>

    </div>

    <div className="grid md:grid-cols-3 gap-6 mt-8 pt-8 border-t">

      <div>

        <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">

          Skills

        </label>

        <select className="w-full h-12 rounded-xl border border-slate-200 px-4">

          <option>All Skills</option>

        </select>

      </div>

      <div>

        <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">

          Language

        </label>

        <select className="w-full h-12 rounded-xl border border-slate-200 px-4">

          <option>Any Language</option>

        </select>

      </div>

      <div>

        <div className="flex justify-between mb-2">

          <span className="text-xs uppercase tracking-widest text-slate-400">

            Max Price

          </span>

          <span className="font-semibold">

            LKR 2,000

          </span>

        </div>

        <input

          type="range"

          min="1000"

          max="3000"

          defaultValue="2000"

          className="w-full accent-[#003898]"

        />

      </div>

    </div>

  </div>

</section>



        {/* --- CARETACKERS CARD GRID SYSTEM --- */}
        <section className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {caretakers.map((caretaker) => (
              <div 
                key={caretaker.id} 
                className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs flex flex-col justify-between"
              >
                
                {/* Profile Image Wrap + Status Pills */}
                <div className="relative w-full aspect-[4/3] bg-slate-100">
                  <Image
                    src={caretaker.image}
                    alt={caretaker.name}
                    fill
                    className="object-cover"
                  />
                  
                  {/* Floating Availability Tag */}
                  <span className={`absolute top-4 left-4 text-[11px] font-bold px-3 py-1.5 rounded-full text-white shadow-xs
                    ${caretaker.availabilityType === 'now' ? 'bg-emerald-600' : ''}
                    ${caretaker.availabilityType === 'week' ? 'bg-sky-500' : ''}
                    ${caretaker.availabilityType === 'weekends' ? 'bg-[#003898]' : ''}
                  `}>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-pulse"></span>
                    {caretaker.availability}
                  </span>

                  {/* Floating Rating Tag */}
                  <span className="absolute top-4 right-4 bg-white/95 backdrop-blur-xs text-slate-950 font-bold text-xs px-2.5 py-1.5 rounded-full flex items-center gap-1 shadow-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {caretaker.rating}
                  </span>
                </div>

                {/* Card Body Core Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {caretaker.name}
                    </h3>
                    
                    {/* Location & Meta Experience row */}
                    <div className="flex flex-wrap items-center gap-4 text-slate-400 text-xs font-medium mt-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-300" />
                        {caretaker.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-slate-300" />
                        {caretaker.exp}
                      </span>
                    </div>

                    {/* Dynamic Competency Skill Chips */}
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {caretaker.tags.map((tag, idx) => (
                        <span 
                          key={idx} 
                          className="text-[11px] font-semibold bg-blue-50/70 text-[#003898] px-2.5 py-1 rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Lower Boundary Footer Segment */}
                  <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      {/* Native Multi-lingual Metadata label */}
                      <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                        <Languages className="w-3 h-3 text-slate-300" />
                        {caretaker.languages}
                      </span>
                      <p className="mt-1 text-slate-900 font-extrabold text-lg leading-none">
                        {caretaker.price} <span className="text-xs font-normal text-slate-400">per hour</span>
                      </p>
                    </div>

                    
                  </div>

                </div>

              </div>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
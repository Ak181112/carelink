"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  User, ShieldCheck, Award, MapPin, CheckSquare, 
  Square, Edit3, ArrowLeft, Send, FileText, Image 
} from "lucide-react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ==========================================
// 1. EMBEDDED ZUSTAND STORE IMPLEMENTATION
// ==========================================
interface ApplicationState {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    dob: string;
    gender: string;
    address: string;
    bio: string;
    profileImage: string | null;
  };
  verification: {
    nicFrontName: string | null;
    policeClearanceName: string | null;
  };
  skills: string[];
  languages: string[];
  hourlyRate: number;
  serviceArea: string[];
  setPersonalInfo: (data: Partial<ApplicationState["personalInfo"]>) => void;
  setVerification: (data: Partial<ApplicationState["verification"]>) => void;
  setSkills: (skills: string[]) => void;
  setLanguages: (languages: string[]) => void;
  setServiceDetails: (rate: number, areas: string[]) => void;
  resetForm: () => void;
}

const useApplicationStore = create<ApplicationState>()(
  persist(
    (set) => ({
      personalInfo: {
        fullName: "Chamathka Perera", 
        email: "chamathka.p@example.com",
        phone: "+94 77 123 4567",
        location: "Kurunegala Central",
        dob: "",
        gender: "",
        address: "",
        bio: "",
        profileImage: null,
      },
      verification: {
        nicFrontName: "NIC_Front.jpg",
        policeClearanceName: "Police_Clearance.pdf",
      },
      skills: ["Elderly Care", "Medication Management", "Wound Dressing", "Dementia Support"],
      languages: ["Sinhala", "English"],
      hourlyRate: 1500,
      serviceArea: ["Colombo", "Kurunegala", "Wattala"],

      setPersonalInfo: (data) =>
        set((state) => ({ personalInfo: { ...state.personalInfo, ...data } })),
      setVerification: (data) =>
        set((state) => ({ verification: { ...state.verification, ...data } })),
      setSkills: (skills) => set({ skills }),
      setLanguages: (languages) => set({ languages }),
      setServiceDetails: (hourlyRate, serviceArea) => set({ hourlyRate, serviceArea }),
      resetForm: () =>
        set({
          personalInfo: { fullName: "", email: "", phone: "", location: "", dob: "", gender: "", address: "", bio: "", profileImage: null },
          verification: { nicFrontName: null, policeClearanceName: null },
          skills: [],
          languages: [],
          hourlyRate: 0,
          serviceArea: [],
        }),
    }),
    {
      name: "carelink-application-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

// ==========================================
// 2. MAIN PAGE COMPONENT INTERFACES & UI
// ==========================================
export default function ReviewSubmitPage() {
  const router = useRouter();
  const [agreed, setAgreed] = useState<boolean>(false);

  // Read centralized data safely from the local store instance
  const {
    personalInfo,
    verification,
    skills,
    languages,
    hourlyRate,
    serviceArea,
    resetForm
  } = useApplicationStore();

  const handleEdit = (stepNumber: number) => {
    const stepsMap: Record<number, string> = {
      1: "/caretakers/firstpage",
      2: "/caretakers/secondpage",
      3: "/caretakers/thirdpage",
      4: "/caretakers/fourthpage",
    };
    router.push(stepsMap[stepNumber] || "/caretakers/firstpage");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;

    const finalPayload = {
      personalInfo,
      verification,
      skills,
      languages,
      hourlyRate,
      serviceArea,
    };

    console.log("Submitting form collection data:", finalPayload);
    
    resetForm();
    router.push("/caretakers/dashboard");
  };

  return (
    <div className="max-w-4xl mx-auto my-8 p-6 bg-slate-50 rounded-xl font-sans text-slate-800">
      
      {/* Step Header Bar */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-slate-900">Review & Submit</h1>
          <span className="text-sm text-slate-500 font-medium">Step 5 of 5</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div className="bg-blue-600 h-full w-full rounded-full" />
        </div>
      </div>

      {/* Navigation Ribbon Setup */}
      <div className="grid grid-cols-5 gap-3 mb-8">
        {[
          { icon: User, label: "About you", step: 1 },
          { icon: ShieldCheck, label: "Verification", step: 2 },
          { icon: Award, label: "Skills", step: 3 },
          { icon: MapPin, label: "Service area", step: 4 },
          { icon: CheckSquare, label: "Review", step: 5, active: true },
        ].map((btn, idx) => (
          <button 
            key={idx}
            type="button"
            disabled={btn.active}
            onClick={() => handleEdit(btn.step)}
            className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all ${
              btn.active 
                ? "bg-white border-blue-600 text-blue-600 shadow-sm font-semibold cursor-default" 
                : "bg-slate-50 border-slate-200 text-slate-400 opacity-60 hover:bg-slate-100"
            }`}
          >
            <btn.icon className="w-5 h-5 mb-1" />
            <span className="text-xs">{btn.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Personal Information */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm relative">
          <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-2">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900">
              <User className="w-5 h-5 text-blue-600" /> Personal Information
            </h2>
            <button 
              type="button" 
              onClick={() => handleEdit(1)} 
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
            >
              <Edit3 className="w-4 h-4" /> Edit
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs font-semibold text-slate-400 tracking-wider block uppercase">Full Name</span>
              <span className="text-slate-700 font-medium block mt-1">{personalInfo.fullName}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 tracking-wider block uppercase">Email Address</span>
              <span className="text-slate-700 font-medium block mt-1">{personalInfo.email}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 tracking-wider block uppercase">Phone Number</span>
              <span className="text-slate-700 font-medium block mt-1">{personalInfo.phone}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 tracking-wider block uppercase">Location</span>
              <span className="text-slate-700 font-medium block mt-1">{personalInfo.location}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Verification Documents */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-2">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900">
              <ShieldCheck className="w-5 h-5 text-blue-600" /> Verification Documents
            </h2>
            <button 
              type="button" 
              onClick={() => handleEdit(2)} 
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
            >
              <Edit3 className="w-4 h-4" /> Edit
            </button>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3 w-64">
              <Image className="w-8 h-8 text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-slate-700 truncate max-w-[160px]">
                  {verification.nicFrontName || "NIC_Front.jpg"}
                </p>
                <span className="text-xs text-emerald-600 font-medium block">Verified Image</span>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3 w-64">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-slate-700 truncate max-w-[160px]">
                  {verification.policeClearanceName || "Police_Clearance.pdf"}
                </p>
                <span className="text-xs text-slate-400 block">Certificate</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Expertise & Skills */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-2">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900">
              <Award className="w-5 h-5 text-blue-600" /> Expertise & Skills
            </h2>
            <button 
              type="button" 
              onClick={() => handleEdit(3)} 
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
            >
              <Edit3 className="w-4 h-4" /> Edit
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-slate-400 tracking-wider block uppercase mb-2">Core Skills</span>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span key={index} className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 tracking-wider block uppercase mb-2">Languages</span>
              <div className="flex gap-4">
                {languages.map((lang, index) => (
                  <span key={index} className="flex items-center gap-1 text-sm text-slate-700 font-medium">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]">✓</span>
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Service & Availability */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-2">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900">
              <MapPin className="w-5 h-5 text-blue-600" /> Service & Availability
            </h2>
            <button 
              type="button" 
              onClick={() => handleEdit(4)} 
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
            >
              <Edit3 className="w-4 h-4" /> Edit
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="text-xs font-semibold text-slate-400 tracking-wider block uppercase">Hourly Rate</span>
              <p className="mt-1">
                <strong className="text-2xl font-black text-blue-800">LKR {hourlyRate.toLocaleString()}</strong>
                <span className="text-slate-400 text-sm font-medium"> / hour</span>
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 tracking-wider block uppercase">Preferred Service Areas</span>
              <p className="text-slate-700 font-medium text-sm mt-2">
                {serviceArea.join(", ")}
              </p>
            </div>
          </div>
        </div>

        {/* Legal Declaration Checkbox Container */}
        <div 
          onClick={() => setAgreed(!agreed)}
          className={`flex items-start gap-3 p-5 rounded-xl border cursor-pointer transition-all ${
            agreed ? "bg-amber-50/40 border-amber-200" : "bg-orange-50/30 border-orange-100"
          }`}
        >
          <div className="mt-0.5 text-blue-600">
            {agreed ? <CheckSquare className="w-5 h-5 fill-blue-50 text-blue-600" /> : <Square className="w-5 h-5 text-slate-300" />}
          </div>
          <p className="text-xs text-slate-600 leading-relaxed select-none">
            I confirm that all the information provided above is accurate to the best of my knowledge. I have read and agree to CareLink+’s <a href="#terms" className="text-blue-600 font-semibold underline">Terms of Service</a> and <a href="#privacy" className="text-blue-600 font-semibold underline">Privacy Policy</a> regarding caretaker applications.
          </p>
        </div>

        {/* Action Controls Group */}
        <div className="flex justify-between items-center pt-4">
          <button
            type="button"
            onClick={() => handleEdit(4)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold text-sm px-4 py-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Edit
          </button>
          
          <button
            type="submit"
            disabled={!agreed}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all ${
              agreed 
                ? "bg-blue-900 hover:bg-blue-950 text-white cursor-pointer" 
                : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
            }`}
          >
            Submit Application <Send className="w-4 h-4 transform rotate-[-30deg]" />
          </button>
        </div>
      </form>

      <p className="text-center text-xs text-slate-400 font-medium mt-8">
        Your application will be reviewed by our team within 48 hours.
      </p>
    </div>
  );
}
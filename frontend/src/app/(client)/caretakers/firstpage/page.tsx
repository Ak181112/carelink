"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  User, ShieldCheck, Award, MapPin, CheckSquare, 
  Camera, ArrowLeft, ArrowRight, Shield, Heart, Zap, AlertCircle 
} from "lucide-react";

// Form errors interface
interface FormErrors {
  dob?: string;
  gender?: string;
  address?: string;
  bio?: string;
}

export default function AboutYouStep() {
  const router = useRouter();
  
  // Local form state
  const [dob, setDob] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  // Validation state
  const [errors, setErrors] = useState<FormErrors>({});

  const maxBioLength = 500;

  // Presence check validation logic
  const validateForm = (): boolean => {
    const tempErrors: FormErrors = {};
    if (!dob) tempErrors.dob = "Date of birth is required.";
    if (!gender) tempErrors.gender = "Please select your gender.";
    if (!address.trim()) tempErrors.address = "Address is required.";
    if (!bio.trim()) tempErrors.bio = "Please write a short introduction about yourself.";
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      router.push("/caretakers/secondpage");
    }
  };

  const handleStepNavigation = (stepPath: string) => {
    if (validateForm()) {
      router.push(stepPath);
    }
  };

  const handleExit = () => {
    // Redirects user back to the sign-in application route directly
    router.push("/login"); 
  };

  return (
    <div className="max-w-4xl mx-auto my-6 p-6 bg-[#f8fafc] rounded-xl font-sans text-slate-800">
      
      {/* Top Tagline */}
      <p className="text-sm text-slate-500 mb-4 font-medium">
        Apply once. Get verified. Start receiving bookings.
      </p>

      {/* Header & Step Progress */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-4 border border-slate-100">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-xl font-bold text-slate-900">About you</h1>
          <span className="text-sm text-slate-500 font-medium">Step 1 of 5</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div className="bg-blue-600 h-full w-1/5 rounded-full" />
        </div>
      </div>

      {/* 5-Step Buttons Interactive Ribbon */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {[
          { icon: User, label: "About you", path: "/caretakers/firstpage", active: true },
          { icon: ShieldCheck, label: "Verification", path: "/caretakers/secondpage" },
          { icon: Award, label: "Skills & languages", path: "/caretakers/thirdpage" },
          { icon: MapPin, label: "Service area & rate", path: "/caretakers/fourthpage" },
          { icon: CheckSquare, label: "Review & submit", path: "/caretakers/fifthpage" },
        ].map((step, idx) => (
          <button 
            key={idx}
            type="button"
            onClick={() => step.active ? null : handleStepNavigation(step.path)}
            className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all cursor-pointer outline-none focus:ring-2 focus:ring-blue-400 ${
              step.active 
                ? "bg-white border-blue-600 text-blue-600 shadow-sm font-semibold" 
                : "bg-slate-50/50 border-slate-200 text-slate-400 opacity-80 hover:bg-slate-100/70"
            }`}
          >
            <step.icon className="w-5 h-5 mb-1" />
            <span className="text-xs">{step.label}</span>
          </button>
        ))}
      </div>

      {/* Primary Context Form Card */}
      <form onSubmit={handleContinue} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Personal Details</h2>
          <p className="text-sm text-slate-500 mt-0.5">Tell us more about yourself to help families in Kurunegala trust you.</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile Photo Upload Segment */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="Profile preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 stroke-[1.5]" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow shadow-blue-300 transition-colors">
                <Camera className="w-4 h-4" />
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files?.[0]) setProfileImage(URL.createObjectURL(e.target.files[0]));
                  }} 
                />
              </label>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Profile Photo</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-md mt-0.5">
                Families prefer caretakers with clear, friendly photos. Make sure your face is visible and well-lit.
              </p>
            </div>
          </div>

          {/* Date of Birth & Gender Selection Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Date of Birth</label>
              <input 
                type="date"
                value={dob}
                onChange={(e) => {
                  setDob(e.target.value);
                  if(errors.dob) setErrors({...errors, dob: undefined});
                }}
                className={`w-full px-3 py-2.5 bg-white border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 ${
                  errors.dob ? "border-red-500 focus:ring-red-500" : "border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                }`}
              />
              {errors.dob && (
                <p className="text-xs text-red-500 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.dob}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Gender</label>
              <select
                value={gender}
                onChange={(e) => {
                  setGender(e.target.value);
                  if(errors.gender) setErrors({...errors, gender: undefined});
                }}
                className={`w-full px-3 py-2.5 bg-white border rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%20%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat ${
                  errors.gender ? "border-red-500 focus:ring-red-500" : "border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                }`}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && (
                <p className="text-xs text-red-500 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.gender}
                </p>
              )}
            </div>
          </div>

          {/* Address Information */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Address in Kurunegala District</label>
            <input 
              type="text"
              placeholder="e.g. 123/A Negombo Road, Kurunegala"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if(errors.address) setErrors({...errors, address: undefined});
              }}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 ${
                errors.address ? "border-red-500 focus:ring-red-500" : "border-slate-200 focus:border-blue-500 focus:ring-blue-500"
              }`}
            />
            {errors.address && (
              <p className="text-xs text-red-500 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.address}
              </p>
            )}
          </div>

          {/* Bio Description Details */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Bio / Introduction</label>
            <textarea 
              rows={4}
              maxLength={maxBioLength}
              placeholder="Share your experience and why you love caretaking..."
              value={bio}
              onChange={(e) => {
                setBio(e.target.value);
                if(errors.bio) setErrors({...errors, bio: undefined});
              }}
              className={`w-full px-4 py-3 border rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 resize-none ${
                errors.bio ? "border-red-500 focus:ring-red-500" : "border-slate-200 focus:border-blue-500 focus:ring-blue-500"
              }`}
            />
            <div className="flex justify-between items-center mt-1">
              <div>
                {errors.bio && (
                  <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.bio}
                  </p>
                )}
              </div>
              <div className="text-right text-[11px] text-slate-400 font-medium">
                {bio.length} / {maxBioLength} characters
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation Panel within the main form box */}
        <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-100 flex justify-between items-center">
          <button
            type="button"
            onClick={handleExit}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-semibold text-sm transition-colors py-2"
          >
            <ArrowLeft className="w-4 h-4" /> Exit
          </button>
          
          <button
            type="submit"
            className="flex items-center gap-1.5 bg-blue-800 hover:bg-blue-900 text-white font-bold text-sm px-7 py-3 rounded-full shadow transition-all"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Trust Badges Trio Lineup */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-start gap-3 p-4 bg-emerald-50/60 rounded-xl border border-emerald-100">
          <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-emerald-900">Secure Data</h4>
            <p className="text-[11px] text-emerald-700 leading-relaxed mt-0.5">Your data is encrypted and only shared with verified families.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 bg-blue-50/60 rounded-xl border border-blue-100">
          <Heart className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-blue-900">Local Support</h4>
            <p className="text-[11px] text-blue-700 leading-relaxed mt-0.5">Dedicated support for our Kurunegala community caretakers.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 bg-amber-50/40 rounded-xl border border-amber-100">
          <Zap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-900">Fast Approval</h4>
            <p className="text-[11px] text-amber-700 leading-relaxed mt-0.5">Complete your profile fully to get verified within 48 hours.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
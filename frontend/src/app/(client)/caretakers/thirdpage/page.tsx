"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  ShieldCheck,
  Languages,
  MapPin,
  FileCheck,
  ShieldAlert,
} from "lucide-react";

type Errors = {
  skills?: string;
  languages?: string;
  experience?: string;
};

export default function SkillsLanguagesPage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(3);

  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    "Wound Dressing",
    "Vital Signs Monitoring",
  ]);

  const [languages, setLanguages] = useState({
    sinhala: { checked: true, proficiency: "native" },
    english: { checked: false, proficiency: "intermediate" },
    tamil: { checked: false, proficiency: "fluent" },
  });

  // ✅ replaced input with dropdown
  const [yearsExperience, setYearsExperience] = useState("");

  const [errors, setErrors] = useState<Errors>({});

  const steps = [
    { id: 1, label: "About you", icon: User },
    { id: 2, label: "Verification", icon: ShieldCheck },
    { id: 3, label: "Skills & languages", icon: Languages },
    { id: 4, label: "Service area & rate", icon: MapPin },
    { id: 5, label: "Review & submit", icon: FileCheck },
  ];

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  const handleLanguageCheck = (
    lang: "sinhala" | "english" | "tamil"
  ) => {
    setLanguages((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], checked: !prev[lang].checked },
    }));
  };

  const handleProficiencyChange = (
    lang: "sinhala" | "english" | "tamil",
    value: string
  ) => {
    setLanguages((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], proficiency: value },
    }));
  };

  // ✅ Validation
  const validate = () => {
    const newErrors: Errors = {};

    if (selectedSkills.length === 0) {
      newErrors.skills = "Please select at least one skill.";
    }

    if (!languages.sinhala.checked &&
        !languages.english.checked &&
        !languages.tamil.checked) {
      newErrors.languages = "Select at least one language.";
    }

    if (!yearsExperience) {
      newErrors.experience = "Please select your years of experience.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ NEXT PAGE
  const handleContinue = () => {
    if (validate()) {
      router.push("/caretakers/fourthpage"); // 🔥 change if needed
    }
  };

  // ✅ BACK PAGE
  const handleBack = () => {
    router.push("/caretakers/secondpage"); // 🔥 change if needed
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleContinue();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <main className="max-w-4xl mx-auto px-4 py-8">

        {/* Progress */}
        <div className="bg-white rounded-xl border p-5 mb-6">
          <div className="flex justify-between mb-2">
            <span className="font-semibold">
              {steps.find((s) => s.id === currentStep)?.label}
            </span>
            <span className="text-xs">Step {currentStep} of 5</span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className={`h-2 rounded-full ${
                  n <= currentStep ? "bg-blue-600" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border p-6 space-y-8"
        >

          {/* SKILLS */}
          <div>
            <h3 className="font-bold">Core Skills</h3>

            <div className="flex flex-wrap gap-2 mt-3">
              {[
                "Wound Dressing",
                "Vital Signs Monitoring",
                "Dementia Support",
                "Elderly Care",
              ].map((skill) => (
                <button
                  type="button"
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1 rounded-full border text-sm ${
                    selectedSkills.includes(skill)
                      ? "bg-blue-100 border-blue-500 text-blue-700"
                      : "border-slate-300"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>

            {errors.skills && (
              <p className="text-red-500 text-xs mt-2">
                {errors.skills}
              </p>
            )}
          </div>

          {/* LANGUAGES */}
          <div>
            <h3 className="font-bold">Languages</h3>

            {errors.languages && (
              <p className="text-red-500 text-xs mt-1">
                {errors.languages}
              </p>
            )}

            {(["sinhala", "english", "tamil"] as const).map((lang) => (
              <div key={lang} className="flex gap-4 mt-3 items-center">
                <input
                  type="checkbox"
                  checked={languages[lang].checked}
                  onChange={() => handleLanguageCheck(lang)}
                />

                <span className="w-24 capitalize">{lang}</span>

                <select
                  disabled={!languages[lang].checked}
                  value={languages[lang].proficiency}
                  onChange={(e) =>
                    handleProficiencyChange(lang, e.target.value)
                  }
                  className="border p-2 rounded text-sm"
                >
                  <option value="native">Native</option>
                  <option value="fluent">Fluent</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="basic">Basic</option>
                </select>
              </div>
            ))}
          </div>

          {/* EXPERIENCE DROPDOWN */}
          <div>
            <h3 className="font-bold">Years of Experience</h3>

            <select
              value={yearsExperience}
              onChange={(e) => setYearsExperience(e.target.value)}
              className="border p-2 rounded mt-2 w-40"
            >
              <option value="">Select</option>
              {Array.from({ length: 51 }, (_, i) => (
                <option key={i} value={i}>
                  {i} years
                </option>
              ))}
            </select>

            {errors.experience && (
              <p className="text-red-500 text-xs mt-2">
                {errors.experience}
              </p>
            )}
          </div>

          {/* BUTTONS */}
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleBack}
              className="text-blue-700 font-semibold"
            >
              Back
            </button>

            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded"
            >
              Continue →
            </button>
          </div>
        </form>

        {/* Safety */}
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <ShieldAlert size={14} />
          Your data is securely stored.
        </div>
      </main>
    </div>
  );
}
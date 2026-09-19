"use client";

import { useState, useEffect, useRef } from "react";
import { caretakerAPI } from "@/services/api";
import { CaretakerProfile } from "@/types";
import {
  Shield,
  Upload,
  Info,
  Camera,
} from "lucide-react";

const SKILLS = [
  "Patient Care",
  "Medication Support",
  "Mobility Assistance",
  "Hospital Visits",
  "Wound Care",
  "Physiotherapy Support",
  "Cooking & Nutrition",
  "Personal Hygiene",
  "Companionship",
  "Dementia Care",
];

const TOWNS = [
  "Kurunegala",
  "Kuliyapitiya",
  "Nikaweratiya",
  "Maho",
  "Pannala",
  "Ibbagamuwa",
  "Giriulla",
  "Narammala",
  "Alawwa",
  "Polgahawela",
  "Wariyapola",
  "Melsiripura",
];

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
  "http://localhost:5000";

export default function CaretakerProfilePage() {
  const [profile, setProfile] = useState<CaretakerProfile | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    contactNumber: "",
    nicNumber: "",
    address: "",
    district: "Kurunegala",
    town: "",
    experience: "",
    qualifications: "",
    skills: [] as string[],
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const photoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    caretakerAPI
      .getMyProfile()
      .then((data) => {
        if (data.profile) {
          setProfile(data.profile);

          setForm({
            fullName: data.profile.fullName || "",
            contactNumber: data.profile.contactNumber || "",
            nicNumber: data.profile.nicNumber || "",
            address: data.profile.address || "",
            district: data.profile.district || "Kurunegala",
            town: data.profile.town || "",
            experience: data.profile.experience || "",
            qualifications: data.profile.qualifications || "",
            skills: data.profile.skills || [],
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleSkill = (skill: string) => {
    setForm((previous) => ({
      ...previous,
      skills: previous.skills.includes(skill)
        ? previous.skills.filter((item) => item !== skill)
        : [...previous.skills, skill],
    }));
  };

  const handlePhotoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const validateProfile = () => {
    if (!form.fullName.trim()) return "Full name is required.";
    if (!form.contactNumber.trim())
      return "Contact number is required.";
    if (!form.nicNumber.trim()) return "NIC number is required.";
    if (!form.address.trim()) return "Address is required.";
    if (!form.town.trim()) return "Town is required.";
    if (!form.experience.trim()) return "Experience is required.";

    return "";
  };

  const handleSave = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    const validationError = validateProfile();

    if (validationError) {
      setError(validationError);
      setSaving(false);
      return;
    }

    try {
      const formData = new FormData();

      formData.append("fullName", form.fullName);
      formData.append("contactNumber", form.contactNumber);
      formData.append("nicNumber", form.nicNumber);
      formData.append("address", form.address);
      formData.append("district", form.district);
      formData.append("town", form.town);
      formData.append("experience", form.experience);
      formData.append(
        "qualifications",
        form.qualifications
      );

      form.skills.forEach((skill) => {
        formData.append("skills", skill);
      });

      if (photoFile) {
        formData.append("photo", photoFile);
      }

      const data =
        await caretakerAPI.createOrUpdateProfile(
          formData,
          Boolean(profile)
        );

      setProfile(data.profile);

      setSuccess(
        "Profile saved successfully. This address will be compared with your NIC OCR address during caretaker verification."
      );
    } catch (e: unknown) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to save profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const photoUrl =
    photoPreview ||
    (profile?.photo
      ? `${API_URL}${profile.photo}`
      : null);

  const textInput = (
    label: string,
    key: keyof typeof form,
    type = "text",
    required = false,
    placeholder = ""
  ) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[#091E42]">
        {label}
        {required && " *"}
      </label>

      <input
        type={type}
        value={form[key] as string}
        required={required}
        placeholder={placeholder}
        onChange={(event) =>
          setForm((previous) => ({
            ...previous,
            [key]: event.target.value,
          }))
        }
        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-[15px] text-[#091E42] outline-none transition-all duration-300 focus:border-[#003898] focus:bg-white focus:ring-4 focus:ring-[#003898]/10"
      />
    </div>
  );

  if (loading) {
    return (
      <div className="py-20 text-center text-[#42526E]">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-3xl">

      {/* Header */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">

        <div>

          <h1 className="text-4xl font-bold text-[#091E42]">
            My Profile
          </h1>

          <p className="mt-2 text-gray-500">
            Complete your profile to apply as a caretaker.
          </p>

        </div>

        

      </div>

      {/* Alerts */}

      {success && (
        <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
          {error}
        </div>
      )}

      {/* Verification Notice */}

      <div className="mb-6 rounded-3xl border border-blue-100 bg-[#F4F8FF] p-6 shadow-sm">

        <div className="flex items-start gap-3">

          <div className="rounded-xl bg-blue-100 p-2">
            <Info className="h-5 w-5 text-[#0052CC]" />
          </div>

          <div>

            <h3 className="font-bold text-[#091E42]">
              Verification Notice
            </h3>

            <p className="mt-1 text-sm text-[#42526E] leading-6">
              Your residential address will be compared with the
              address extracted from your NIC using OCR during the
              caretaker verification process. Please enter the
              address exactly as it appears on your NIC.
            </p>

          </div>

        </div>

      </div>

      <form
        id="caretaker-profile-form"
        onSubmit={handleSave}
        className="space-y-6"
      >

        {/* Profile Summary Card */}

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg">

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

            <div className="relative">

              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#0052CC] ring-4 ring-blue-100 shadow-sm">

                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-white">
                    {form.fullName
                      ? form.fullName.charAt(0).toUpperCase()
                      : "C"}
                  </span>
                )}

              </div>

              <button
                type="button"
                onClick={() => photoRef.current?.click()}
                className="absolute -bottom-1 -right-1 rounded-full bg-[#003898] p-2 text-white shadow-lg hover:bg-[#0747A6]"
              >
                <Camera className="h-4 w-4" />
              </button>

            </div>

            <div className="flex-1">

              <h2 className="text-2xl font-bold text-[#091E42]">
                {form.fullName || "Your Name"}
              </h2>

              <div className="mt-2 flex flex-wrap gap-2">

                <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-3 py-1 text-xs font-bold text-[#0052CC]">
                  <Shield className="h-3.5 w-3.5" />
                  Caretaker
                </span>

              </div>

              <input
                ref={photoRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => photoRef.current?.click()}
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#091E42] transition-all duration-300 hover:bg-slate-50"
              >
                <Upload className="h-4 w-4" />
                Upload Photo
              </button>

              <p className="mt-2 text-xs text-slate-500">
                JPG or PNG • Maximum size 5MB
              </p>

            </div>

          </div>

        </div>
                {/* Personal Information */}

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg">

          <h3 className="border-b border-slate-100 pb-3 text-lg font-bold text-[#091E42]">
            Personal Information
          </h3>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">

            {textInput("Full Name", "fullName", "text", true)}

            {textInput(
              "Contact Number",
              "contactNumber",
              "tel",
              true
            )}

            {textInput(
              "NIC Number",
              "nicNumber",
              "text",
              true
            )}

          </div>

          <div className="mt-6 space-y-2">

            <label className="block text-sm font-medium text-[#091E42]">
              Address *
            </label>

            <textarea
              value={form.address}
              required
              rows={4}
              placeholder="Enter your residential address exactly as it appears on your NIC."
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  address: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[15px] text-[#091E42] outline-none transition-all duration-300 focus:border-[#003898] focus:bg-white focus:ring-4 focus:ring-[#003898]/10"
            />

          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">

            <div className="space-y-2">

              <label className="block text-sm font-medium text-[#091E42]">
                District *
              </label>

              <input
                value={form.district}
                readOnly
                className="h-12 w-full rounded-xl border border-slate-200 bg-[#F4F8FF] px-4 text-[15px] font-medium text-[#003898]"
              />

              <p className="text-xs text-slate-500">
                Pilot area is currently limited to Kurunegala District.
              </p>

            </div>

            <div className="space-y-2">

              <label className="block text-sm font-medium text-[#091E42]">
                Town *
              </label>

              <select
                value={form.town}
                required
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    town: event.target.value,
                  }))
                }
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-[15px] text-[#091E42] outline-none transition-all duration-300 focus:border-[#003898] focus:bg-white focus:ring-4 focus:ring-[#003898]/10"
              >
                <option value="">
                  Select Town
                </option>

                {TOWNS.map((town) => (
                  <option
                    key={town}
                    value={town}
                  >
                    {town}
                  </option>
                ))}

              </select>

            </div>

          </div>

        </div>

        {/* Professional Information */}

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg">

          <h3 className="border-b border-slate-100 pb-3 text-lg font-bold text-[#091E42]">
            Professional Information
          </h3>

          <div className="mt-6 space-y-6">

            <div className="space-y-2">

              <label className="block text-sm font-medium text-[#091E42]">
                Experience *
              </label>

              <select
                value={form.experience}
                required
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    experience: event.target.value,
                  }))
                }
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-[15px] text-[#091E42] outline-none transition-all duration-300 focus:border-[#003898] focus:bg-white focus:ring-4 focus:ring-[#003898]/10"
              >
                <option value="">
                  Select Experience
                </option>

                <option value="Less than 1 year">
                  Less than 1 year
                </option>

                <option value="1-2 years">
                  1–2 years
                </option>

                <option value="3-5 years">
                  3–5 years
                </option>

                <option value="5+ years">
                  5+ years
                </option>

              </select>

            </div>

            <div className="space-y-2">

              <label className="block text-sm font-medium text-[#091E42]">
                Qualifications
              </label>

              <textarea
                rows={4}
                value={form.qualifications}
                placeholder="Nursing Certificate, First Aid Training, Caregiving Courses..."
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    qualifications:
                      event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[15px] text-[#091E42] outline-none transition-all duration-300 focus:border-[#003898] focus:bg-white focus:ring-4 focus:ring-[#003898]/10"
              />

            </div>

          </div>

        </div>
                {/* Skills & Services */}

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg">

          <h3 className="border-b border-slate-100 pb-3 text-lg font-bold text-[#091E42]">
            Skills & Services
          </h3>

          <p className="mt-3 text-sm text-slate-500">
            Select all the services you are confident providing to clients.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">

            {SKILLS.map((skill) => (

              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300

                  ${
                    form.skills.includes(skill)
                      ? "bg-[#003898] text-white shadow-md ring-4 ring-blue-100"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-[#003898] hover:text-[#003898] hover:bg-blue-50"
                  }
                `}
              >
                {skill}
              </button>

            ))}

          </div>

        </div>

        {/* Bottom Action */}

        <div className="flex justify-end">

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center rounded-xl bg-[#003898] px-8 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-[#0747A6] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : profile
              ? "Update Profile"
              : "Save Profile"}
          </button>

        </div>

      </form>

    </div>);}
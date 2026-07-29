"use client";

import { useState, useEffect, useRef } from "react";
import { caretakerAPI } from "@/services/api";
import { CaretakerProfile } from "@/types";
import { formatPhoneNumber, isValidPhoneNumber } from "@/lib/phoneUtils";

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

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const validateProfile = () => {
    if (!form.fullName.trim()) return "Full name is required.";
    if (!form.contactNumber.trim()) return "Contact number is required.";
    if (!isValidPhoneNumber(form.contactNumber)) return "Contact number must be a 10-digit Sri Lankan number starting with 07 (e.g. 0712345678).";
    if (!form.nicNumber.trim()) return "NIC number is required.";
    if (!form.address.trim()) return "Address is required.";
    if (!form.town.trim()) return "Town is required.";
    if (!form.experience.trim()) return "Experience is required.";

    return "";
  };

  const handleSave = async (event: React.FormEvent) => {
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
      formData.append("qualifications", form.qualifications);

      form.skills.forEach((skill) => {
        formData.append("skills", skill);
      });

      if (photoFile) {
        formData.append("photo", photoFile);
      }

      const data = await caretakerAPI.createOrUpdateProfile(
        formData,
        Boolean(profile),
      );

      setProfile(data.profile);
      setSuccess(
        "Profile saved successfully. This address will be compared with your NIC OCR address during caretaker verification.",
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const photoUrl =
    photoPreview || (profile?.photo ? `${API_URL}${profile.photo}` : null);

  const textInput = (
    label: string,
    key: keyof typeof form,
    type = "text",
    required = false,
    placeholder = "",
  ) => {
    const isPhone = key === "contactNumber";
    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#091E42]">
          {label}
          {required && " *"}
        </label>

        <input
          type={type}
          value={form[key] as string}
          required={required}
          maxLength={isPhone ? 10 : undefined}
          placeholder={isPhone ? "07XXXXXXXX" : placeholder}
          onChange={(event) => {
            const val = isPhone ? formatPhoneNumber(event.target.value) : event.target.value;
            setForm((previous) => ({
              ...previous,
              [key]: val,
            }));
          }}
          className="h-11 w-full rounded-xl border border-[#DFE1E6] px-4 text-sm outline-none focus:border-[#0052CC]"
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-[#42526E]">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#091E42]">
          My Profile
        </h1>
        <p className="mt-1 text-[#42526E]">
          Complete your profile to apply as a caretaker.
        </p>
      </div>

      {success && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mb-6 rounded-xl border border-blue-200 bg-[#EEF4FF] p-4 text-sm text-[#42526E]">
        <strong>Verification Note:</strong> Your profile address below is used
        to compare with the address extracted from your NIC document using OCR.
        Please enter the same address as shown on your NIC.
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-2xl border border-[#DFE1E6] bg-white p-6">
          <h2 className="mb-4 text-lg font-bold text-[#091E42]">
            Profile Photo
          </h2>

          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-[#DFE1E6] bg-[#EEF4FF]">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- external backend-served upload, not whitelisted for next/image
                <img
                  src={photoUrl}
                  alt="Photo"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-3xl">👤</span>
              )}
            </div>

            <div>
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
                className="rounded-xl border border-[#DFE1E6] px-4 py-2 text-sm font-medium text-[#091E42] hover:bg-gray-50"
              >
                Upload Photo
              </button>

              <p className="mt-1.5 text-xs text-[#6B7280]">
                JPG or PNG, max 5MB
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-[#DFE1E6] bg-white p-6">
          <h2 className="text-lg font-bold text-[#091E42]">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {textInput("Full Name", "fullName", "text", true)}
            {textInput("Contact Number", "contactNumber", "tel", true)}
            {textInput("NIC Number", "nicNumber", "text", true)}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#091E42]">
              Address *
            </label>

            <textarea
              value={form.address}
              required
              rows={3}
              placeholder="Enter your full residential address exactly as it appears in your NIC"
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  address: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-[#DFE1E6] px-4 py-3 text-sm outline-none focus:border-[#0052CC]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#091E42]">
              District *
            </label>

            <input
              value={form.district}
              readOnly
              className="h-11 w-full rounded-xl border border-[#DFE1E6] bg-gray-50 px-4 text-sm text-[#42526E] outline-none"
            />

            <p className="mt-1 text-xs text-[#6B7280]">
              The pilot area is limited to Kurunegala district.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#091E42]">
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
              className="h-11 w-full rounded-xl border border-[#DFE1E6] px-4 text-sm outline-none focus:border-[#0052CC]"
            >
              <option value="">Select town (Kurunegala District)</option>

              {TOWNS.map((town) => (
                <option key={town} value={town}>
                  {town}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#091E42]">
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
              className="h-11 w-full rounded-xl border border-[#DFE1E6] px-4 text-sm outline-none focus:border-[#0052CC]"
            >
              <option value="">Select experience level</option>
              <option value="Less than 1 year">Less than 1 year</option>
              <option value="1-2 years">1-2 years</option>
              <option value="3-5 years">3-5 years</option>
              <option value="5+ years">5+ years</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#091E42]">
              Qualifications
            </label>

            <textarea
              value={form.qualifications}
              rows={3}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  qualifications: event.target.value,
                }))
              }
              placeholder="e.g., Nursing Certificate, First Aid Training..."
              className="w-full rounded-xl border border-[#DFE1E6] px-4 py-3 text-sm outline-none focus:border-[#0052CC]"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-[#DFE1E6] bg-white p-6">
          <h2 className="mb-4 text-lg font-bold text-[#091E42]">
            Skills & Services
          </h2>

          <div className="flex flex-wrap gap-2">
            {SKILLS.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  form.skills.includes(skill)
                    ? "border-[#0052CC] bg-[#0052CC] text-white"
                    : "border-[#DFE1E6] bg-white text-[#42526E] hover:border-[#0052CC] hover:text-[#0052CC]"
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="h-12 w-full rounded-2xl bg-[#0052CC] text-base font-semibold text-white transition hover:bg-[#0747A6] disabled:opacity-60"
        >
          {saving ? "Saving..." : profile ? "Update Profile" : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
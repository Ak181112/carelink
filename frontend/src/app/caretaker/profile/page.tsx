"use client";

import { useState, useEffect, useRef } from "react";
import { caretakerAPI } from "@/services/api";
import { CaretakerProfile } from "@/types";

const SKILLS = ["Patient Care", "Medication Support", "Mobility Assistance", "Hospital Visits", "Wound Care", "Physiotherapy Support", "Cooking & Nutrition", "Personal Hygiene", "Companionship", "Dementia Care"];
const TOWNS = ["Kurunegala", "Kuliyapitiya", "Nikaweratiya", "Maho", "Pannala", "Ibbagamuwa", "Giriulla", "Narammala", "Alawwa", "Polgahawela", "Wariyapola", "Melsiripura"];
const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";

export default function CaretakerProfilePage() {
  const [profile, setProfile] = useState<CaretakerProfile | null>(null);
  const [form, setForm] = useState({
    fullName: "", contactNumber: "", nicNumber: "", address: "", town: "",
    experience: "", qualifications: "", skills: [] as string[],
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const photoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    caretakerAPI.getMyProfile()
      .then((d) => {
        if (d.profile) {
          setProfile(d.profile);
          setForm({
            fullName: d.profile.fullName || "", contactNumber: d.profile.contactNumber || "",
            nicNumber: d.profile.nicNumber || "", address: d.profile.address || "",
            town: d.profile.town || "", experience: d.profile.experience || "",
            qualifications: d.profile.qualifications || "", skills: d.profile.skills || [],
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleSkill = (skill: string) => {
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(skill) ? f.skills.filter((s) => s !== skill) : [...f.skills, skill],
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (Array.isArray(v)) v.forEach((item) => fd.append(k, item));
        else fd.append(k, v as string);
      });
      if (photoFile) fd.append("photo", photoFile);
      const data = await caretakerAPI.createOrUpdateProfile(fd, !!profile);
      setProfile(data.profile);
      setSuccess("Profile saved successfully!");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const photoUrl = photoPreview || (profile?.photo ? `${API_URL}${profile.photo}` : null);

  const inp = (label: string, key: keyof typeof form, type = "text", required = false) => (
    <div>
      <label className="block text-sm font-medium text-[#091E42] mb-1.5">{label}{required && " *"}</label>
      <input type={type} value={form[key] as string} required={required}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="h-11 w-full rounded-xl border border-[#DFE1E6] px-4 text-sm outline-none focus:border-[#0052CC]"
      />
    </div>
  );

  if (loading) return <div className="text-center py-16 text-[#42526E]">Loading...</div>;

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#091E42]">My Profile</h1>
        <p className="mt-1 text-[#42526E]">Complete your profile to apply as a caretaker</p>
      </div>

      {success && <div className="mb-6 rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-700">{success}</div>}
      {error && <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">{error}</div>}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Photo */}
        <div className="bg-white rounded-2xl border border-[#DFE1E6] p-6">
          <h2 className="text-lg font-bold text-[#091E42] mb-4">Profile Photo</h2>
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-full border border-[#DFE1E6] overflow-hidden bg-[#EEF4FF] flex items-center justify-center">
              {photoUrl ? <img src={photoUrl} alt="Photo" className="h-full w-full object-cover" /> : <span className="text-3xl">👤</span>}
            </div>
            <div>
              <input ref={photoRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              <button type="button" onClick={() => photoRef.current?.click()}
                className="rounded-xl border border-[#DFE1E6] px-4 py-2 text-sm font-medium text-[#091E42] hover:bg-gray-50">
                Upload Photo
              </button>
              <p className="mt-1.5 text-xs text-[#6B7280]">JPG or PNG, max 5MB</p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-[#DFE1E6] p-6 space-y-4">
          <h2 className="text-lg font-bold text-[#091E42]">Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {inp("Full Name", "fullName", "text", true)}
            {inp("Contact Number", "contactNumber", "tel", true)}
            {inp("NIC Number", "nicNumber", "text", true)}
          </div>
          {inp("Address", "address", "text", true)}
          <div>
            <label className="block text-sm font-medium text-[#091E42] mb-1.5">Town *</label>
            <select value={form.town} required onChange={(e) => setForm((f) => ({ ...f, town: e.target.value }))}
              className="h-11 w-full rounded-xl border border-[#DFE1E6] px-4 text-sm outline-none focus:border-[#0052CC]">
              <option value="">Select town (Kurunegala District)</option>
              {TOWNS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#091E42] mb-1.5">Experience *</label>
            <select value={form.experience} required onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
              className="h-11 w-full rounded-xl border border-[#DFE1E6] px-4 text-sm outline-none focus:border-[#0052CC]">
              <option value="">Select experience level</option>
              <option value="Less than 1 year">Less than 1 year</option>
              <option value="1-2 years">1-2 years</option>
              <option value="3-5 years">3-5 years</option>
              <option value="5+ years">5+ years</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#091E42] mb-1.5">Qualifications</label>
            <textarea value={form.qualifications} rows={3}
              onChange={(e) => setForm((f) => ({ ...f, qualifications: e.target.value }))}
              placeholder="e.g., Nursing Certificate, First Aid Training..."
              className="w-full rounded-xl border border-[#DFE1E6] px-4 py-3 text-sm outline-none focus:border-[#0052CC]" />
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-2xl border border-[#DFE1E6] p-6">
          <h2 className="text-lg font-bold text-[#091E42] mb-4">Skills & Services</h2>
          <div className="flex flex-wrap gap-2">
            {SKILLS.map((skill) => (
              <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition border
                  ${form.skills.includes(skill)
                    ? "bg-[#0052CC] text-white border-[#0052CC]"
                    : "bg-white text-[#42526E] border-[#DFE1E6] hover:border-[#0052CC] hover:text-[#0052CC]"}`}>
                {skill}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="w-full h-12 rounded-2xl bg-[#0052CC] text-base font-semibold text-white hover:bg-[#0747A6] transition disabled:opacity-60">
          {saving ? "Saving..." : profile ? "Update Profile" : "Save Profile"}
        </button>
      </form>
    </div>
  );
}

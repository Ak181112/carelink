"use client";

import { useState, useEffect } from "react";
import { parentAPI } from "@/services/api";
import { ParentProfile } from "@/types";

const emptyForm = {
  fullName: "", age: "", gender: "", address: "", district: "Kurunegala", town: "",
  contactNumber: "", emergencyContactName: "", emergencyContactPhone: "", emergencyContactRelationship: "",
  medicalConditions: "", specialRequirements: "",
};

const KURUNEGALA_TOWNS = [
  "Kurunegala", "Kuliyapitiya", "Nikaweratiya", "Maho", "Pannala", "Ibbagamuwa",
  "Giriulla", "Narammala", "Alawwa", "Polgahawela", "Wariyapola", "Melsiripura",
  "Polpithigama", "Ganewatta", "Bingiriya",
];

export default function ParentsPage() {
  const [profiles, setProfiles] = useState<ParentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    try {
      const data = await parentAPI.getAll();
      setProfiles(data.profiles || []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setForm({ ...emptyForm });
    setEditId(null);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const openEdit = (p: ParentProfile) => {
    setForm({
      fullName: p.fullName, age: p.age?.toString() || "", gender: p.gender || "",
      address: p.address, district: p.district || "Kurunegala", town: p.town || "",
      contactNumber: p.contactNumber,
      emergencyContactName: p.emergencyContact?.name || "",
      emergencyContactPhone: p.emergencyContact?.phone || "",
      emergencyContactRelationship: p.emergencyContact?.relationship || "",
      medicalConditions: p.medicalConditions || "",
      specialRequirements: p.specialRequirements || "",
    });
    setEditId(p._id);
    setShowForm(true);
    setError("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this parent profile?")) return;
    try {
      await parentAPI.delete(id);
      setProfiles((prev) => prev.filter((p) => p._id !== id));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        fullName: form.fullName, age: form.age ? Number(form.age) : undefined,
        gender: form.gender, address: form.address, district: form.district, town: form.town,
        contactNumber: form.contactNumber,
        emergencyContact: {
          name: form.emergencyContactName, phone: form.emergencyContactPhone,
          relationship: form.emergencyContactRelationship,
        },
        medicalConditions: form.medicalConditions, specialRequirements: form.specialRequirements,
      };
      if (editId) {
        await parentAPI.update(editId, payload);
        setSuccess("Profile updated successfully");
      } else {
        await parentAPI.create(payload);
        setSuccess("Parent profile created successfully");
      }
      await load();
      setShowForm(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const inp = (label: string, key: keyof typeof form, type = "text", required = false) => (
    <div>
      <label className="block text-sm font-medium text-[#091E42] mb-1.5">{label}{required && " *"}</label>
      <input type={type} required={required} value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="h-11 w-full rounded-xl border border-[#DFE1E6] px-4 text-sm outline-none focus:border-[#0052CC]"
      />
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#091E42]">Parent Profiles</h1>
          <p className="mt-1 text-[#42526E]">Manage profiles for your elderly parents</p>
        </div>
        <button onClick={openNew}
          className="rounded-xl bg-[#0052CC] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0747A6] transition">
          ➕ Add Parent
        </button>
      </div>

      {success && <div className="mb-4 rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-700">{success}</div>}
      {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">{error}</div>}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#091E42]">{editId ? "Edit Parent Profile" : "Add Parent Profile"}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">{error}</div>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {inp("Full Name", "fullName", "text", true)}
                {inp("Age", "age", "number")}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#091E42] mb-1.5">Gender</label>
                <select value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-[#DFE1E6] px-4 text-sm outline-none focus:border-[#0052CC]">
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              {inp("Address", "address", "text", true)}
              <div>
                <label className="block text-sm font-medium text-[#091E42] mb-1.5">Town</label>
                <select value={form.town} onChange={(e) => setForm((f) => ({ ...f, town: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-[#DFE1E6] px-4 text-sm outline-none focus:border-[#0052CC]">
                  <option value="">Select town</option>
                  {KURUNEGALA_TOWNS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              {inp("Contact Number", "contactNumber", "tel", true)}
              <h3 className="font-semibold text-[#091E42] pt-2">Emergency Contact</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {inp("Contact Name", "emergencyContactName")}
                {inp("Contact Phone", "emergencyContactPhone", "tel")}
              </div>
              {inp("Relationship", "emergencyContactRelationship")}
              <div>
                <label className="block text-sm font-medium text-[#091E42] mb-1.5">Medical Conditions</label>
                <textarea value={form.medicalConditions}
                  onChange={(e) => setForm((f) => ({ ...f, medicalConditions: e.target.value }))}
                  rows={2} placeholder="e.g., Diabetes, Hypertension"
                  className="w-full rounded-xl border border-[#DFE1E6] px-4 py-3 text-sm outline-none focus:border-[#0052CC]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#091E42] mb-1.5">Special Requirements</label>
                <textarea value={form.specialRequirements}
                  onChange={(e) => setForm((f) => ({ ...f, specialRequirements: e.target.value }))}
                  rows={2} className="w-full rounded-xl border border-[#DFE1E6] px-4 py-3 text-sm outline-none focus:border-[#0052CC]" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="rounded-xl border border-[#DFE1E6] px-5 py-2.5 text-sm font-semibold text-[#42526E]">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="rounded-xl bg-[#0052CC] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#0747A6] disabled:opacity-60">
                  {saving ? "Saving..." : editId ? "Update Profile" : "Create Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profiles List */}
      {loading ? (
        <div className="text-center py-16 text-[#42526E]">Loading...</div>
      ) : profiles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#DFE1E6] p-16 text-center">
          <span className="text-6xl">👴</span>
          <h3 className="mt-4 text-xl font-bold text-[#091E42]">No parent profiles yet</h3>
          <p className="mt-2 text-[#42526E]">Create a profile for your parent to get started.</p>
          <button onClick={openNew}
            className="mt-6 rounded-xl bg-[#0052CC] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0747A6]">
            Add Parent Profile
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profiles.map((p) => (
            <div key={p._id} className="bg-white rounded-2xl border border-[#DFE1E6] p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-[#EEF4FF] flex items-center justify-center text-2xl">👴</div>
                  <div>
                    <h3 className="font-bold text-[#091E42]">{p.fullName}</h3>
                    {p.age && <p className="text-sm text-[#42526E]">Age: {p.age}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(p)}
                    className="rounded-lg border border-[#DFE1E6] px-3 py-1.5 text-xs font-medium text-[#091E42] hover:bg-gray-50">
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleDelete(p._id)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                    🗑️ Delete
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm text-[#42526E]">
                <p>📍 {p.address}{p.town ? `, ${p.town}` : ""}</p>
                <p>📞 {p.contactNumber}</p>
                {p.emergencyContact?.name && <p>🚨 Emergency: {p.emergencyContact.name} ({p.emergencyContact.phone})</p>}
                {p.medicalConditions && <p>🏥 {p.medicalConditions}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

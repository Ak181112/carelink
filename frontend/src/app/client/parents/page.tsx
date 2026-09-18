"use client";

import { useState, useEffect } from "react";
import {
  UserRound,
  CalendarDays,
  MapPin,
  Phone,
  ShieldAlert,
  HeartPulse,
  ClipboardList,
  Pencil,
  Trash2,
  Plus,
  X,
  Save,
  UsersRound,
  UserRoundPlus,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Home,
} from "lucide-react";

import { parentAPI } from "@/services/api";
import { ParentProfile } from "@/types";

const emptyForm = {
  fullName: "",
  age: "",
  gender: "",
  address: "",
  district: "Kurunegala",
  town: "",
  contactNumber: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  emergencyContactRelationship: "",
  medicalConditions: "",
  specialRequirements: "",
};

const KURUNEGALA_TOWNS = [
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
  "Polpithigama",
  "Ganewatta",
  "Bingiriya",
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

  /* =========================================================
     LOAD PROFILES
     Existing functionality preserved
  ========================================================= */

  const load = async () => {
    setLoading(true);

    try {
      const data = await parentAPI.getAll();
      setProfiles(data.profiles || []);
    } catch {
      setError("Unable to load parent profiles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* =========================================================
     CREATE MODE
     Existing functionality preserved
  ========================================================= */

  const openNew = () => {
    setForm({ ...emptyForm });
    setEditId(null);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  /* =========================================================
     EDIT MODE
     Existing functionality preserved
  ========================================================= */

  const openEdit = (p: ParentProfile) => {
    setForm({
      fullName: p.fullName,
      age: p.age?.toString() || "",
      gender: p.gender || "",
      address: p.address,
      district: p.district || "Kurunegala",
      town: p.town || "",
      contactNumber: p.contactNumber,
      emergencyContactName: p.emergencyContact?.name || "",
      emergencyContactPhone: p.emergencyContact?.phone || "",
      emergencyContactRelationship:
        p.emergencyContact?.relationship || "",
      medicalConditions: p.medicalConditions || "",
      specialRequirements: p.specialRequirements || "",
    });

    setEditId(p._id);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  /* =========================================================
     DELETE
     Existing functionality preserved
  ========================================================= */

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this parent profile?")) return;

    try {
      await parentAPI.delete(id);

      setProfiles((prev) =>
        prev.filter((p) => p._id !== id),
      );

      setSuccess("Parent profile deleted successfully.");
      setError("");
    } catch (e: unknown) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to delete parent profile.",
      );
    }
  };

  /* =========================================================
     SAVE
     Existing create/update workflow preserved
  ========================================================= */

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        fullName: form.fullName,
        age: form.age ? Number(form.age) : undefined,
        gender: form.gender,
        address: form.address,
        district: form.district,
        town: form.town,
        contactNumber: form.contactNumber,

        emergencyContact: {
          name: form.emergencyContactName,
          phone: form.emergencyContactPhone,
          relationship: form.emergencyContactRelationship,
        },

        medicalConditions: form.medicalConditions,
        specialRequirements: form.specialRequirements,
      };

      if (editId) {
        await parentAPI.update(editId, payload);
        setSuccess("Profile updated successfully.");
      } else {
        await parentAPI.create(payload);
        setSuccess("Parent profile created successfully.");
      }

      await load();
      setShowForm(false);
    } catch (e: unknown) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to save parent profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     FORM INPUT HELPER
     Existing functionality preserved
  ========================================================= */

  const inp = (
    label: string,
    key: keyof typeof form,
    type = "text",
    required = false,
    placeholder = "",
  ) => (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#172B4D]">
        {label}

        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <input
        type={type}
        required={required}
        value={form[key]}
        placeholder={placeholder}
        onChange={(e) =>
          setForm((f) => ({
            ...f,
            [key]: e.target.value,
          }))
        }
        className="
          h-11
          w-full
          rounded-xl
          border
          border-[#DFE1E6]
          bg-white
          px-4
          text-sm
          text-[#172B4D]
          outline-none
          transition
          placeholder:text-slate-400
          focus:border-[#0052CC]
          focus:ring-4
          focus:ring-blue-100/60
        "
      />
    </div>
  );

  /* =========================================================
     SMALL INFO ITEM
  ========================================================= */

  const InfoItem = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: React.ElementType;
    label: string;
    value?: string;
  }) => {
    if (!value) return null;

    return (
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF4FF] text-[#0052CC]">
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p className="mt-0.5 break-words text-sm font-medium text-[#42526E]">
            {value}
          </p>
        </div>
      </div>
    );
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-7">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          {/* <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#003898]">
            <UsersRound className="h-3.5 w-3.5" />
            Family Care Management
          </div> */}

          <h1 className="text-3xl font-bold tracking-tight text-[#091E42] sm:text-4xl">
            Parent Profiles
          </h1>
        </div>

        <button
          onClick={openNew}
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-[#0052CC]
            px-5
            py-3
            text-sm
            font-bold
            text-white
            shadow-sm
            transition
            hover:bg-[#0747A6]
            hover:shadow-md
            focus:outline-none
            focus:ring-4
            focus:ring-blue-100
          "
        >
          <Plus className="h-4 w-4" />
          Add Parent
        </button>
      </div>

      {/* =====================================================
          SUMMARY BAR
      ====================================================== */}

      {!loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#DFE1E6] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0052CC]">
                <UsersRound className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total Profiles
                </p>

                <p className="mt-1 text-2xl font-bold text-[#091E42]">
                  {profiles.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#DFE1E6] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Ready for Booking
                </p>

                <p className="mt-1 text-2xl font-bold text-[#091E42]">
                  {profiles.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#DFE1E6] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <ShieldAlert className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Emergency Details
                </p>

                <p className="mt-1 text-2xl font-bold text-[#091E42]">
                  {
                    profiles.filter(
                      (p) =>
                        p.emergencyContact?.name ||
                        p.emergencyContact?.phone,
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          SUCCESS / ERROR
      ====================================================== */}

      {success && (
        <div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

          <div>
            <p className="font-bold">Success</p>
            <p className="mt-0.5">{success}</p>
          </div>
        </div>
      )}

      {error && !showForm && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <div>
            <p className="font-bold">Unable to complete action</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* =====================================================
          FORM MODAL
      ====================================================== */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF4FF] text-[#0052CC]">
                  {editId ? (
                    <Pencil className="h-5 w-5" />
                  ) : (
                    <UserRoundPlus className="h-5 w-5" />
                  )}
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[#091E42]">
                    {editId
                      ? "Edit Parent Profile"
                      : "Add Parent Profile"}
                  </h2>

                  <p className="mt-0.5 text-sm text-[#42526E]">
                    Keep important family member information
                    accurate and up to date.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto">
              <form
                onSubmit={handleSave}
                className="space-y-7 p-6 sm:p-7"
              >
                {error && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-600">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                {/* Personal Information */}
                <section>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#0052CC]">
                      <UserRound className="h-4 w-4" />
                    </div>

                    <div>
                      <h3 className="font-bold text-[#172B4D]">
                        Personal Information
                      </h3>

                      <p className="text-xs text-slate-500">
                        Basic information about the parent.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {inp(
                      "Full Name",
                      "fullName",
                      "text",
                      true,
                      "Enter full name",
                    )}

                    {inp(
                      "Age",
                      "age",
                      "number",
                      false,
                      "Enter age",
                    )}
                  </div>

                  <div className="mt-4">
                    <label className="mb-2 block text-sm font-semibold text-[#172B4D]">
                      Gender
                    </label>

                    <select
                      value={form.gender}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          gender: e.target.value,
                        }))
                      }
                      className="
                        h-11
                        w-full
                        rounded-xl
                        border
                        border-[#DFE1E6]
                        bg-white
                        px-4
                        text-sm
                        text-[#172B4D]
                        outline-none
                        transition
                        focus:border-[#0052CC]
                        focus:ring-4
                        focus:ring-blue-100/60
                      "
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </section>

                {/* Address */}
                <section className="border-t border-slate-100 pt-7">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <Home className="h-4 w-4" />
                    </div>

                    <div>
                      <h3 className="font-bold text-[#172B4D]">
                        Residential Information
                      </h3>

                      <p className="text-xs text-slate-500">
                        Used as the default pickup information.
                      </p>
                    </div>
                  </div>

                  {inp(
                    "Address",
                    "address",
                    "text",
                    true,
                    "House number, street, area",
                  )}

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#172B4D]">
                        District
                      </label>

                      <input
                        value={form.district}
                        disabled
                        className="
                          h-11
                          w-full
                          rounded-xl
                          border
                          border-[#DFE1E6]
                          bg-slate-50
                          px-4
                          text-sm
                          text-slate-500
                        "
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#172B4D]">
                        Town
                      </label>

                      <select
                        value={form.town}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            town: e.target.value,
                          }))
                        }
                        className="
                          h-11
                          w-full
                          rounded-xl
                          border
                          border-[#DFE1E6]
                          bg-white
                          px-4
                          text-sm
                          text-[#172B4D]
                          outline-none
                          transition
                          focus:border-[#0052CC]
                          focus:ring-4
                          focus:ring-blue-100/60
                        "
                      >
                        <option value="">
                          Select town
                        </option>

                        {KURUNEGALA_TOWNS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </section>

                {/* Contact */}
                <section className="border-t border-slate-100 pt-7">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                      <Phone className="h-4 w-4" />
                    </div>

                    <div>
                      <h3 className="font-bold text-[#172B4D]">
                        Contact Information
                      </h3>

                      <p className="text-xs text-slate-500">
                        Primary contact number for the parent.
                      </p>
                    </div>
                  </div>

                  {inp(
                    "Contact Number",
                    "contactNumber",
                    "tel",
                    true,
                    "07XXXXXXXX",
                  )}
                </section>

                {/* Emergency */}
                <section className="border-t border-slate-100 pt-7">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
                      <ShieldAlert className="h-4 w-4" />
                    </div>

                    <div>
                      <h3 className="font-bold text-[#172B4D]">
                        Emergency Contact
                      </h3>

                      <p className="text-xs text-slate-500">
                        Important contact information for urgent situations.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {inp(
                      "Contact Name",
                      "emergencyContactName",
                      "text",
                      false,
                      "Emergency contact name",
                    )}

                    {inp(
                      "Contact Phone",
                      "emergencyContactPhone",
                      "tel",
                      false,
                      "07XXXXXXXX",
                    )}
                  </div>

                  <div className="mt-4">
                    {inp(
                      "Relationship",
                      "emergencyContactRelationship",
                      "text",
                      false,
                      "e.g. Son, Daughter, Spouse",
                    )}
                  </div>
                </section>

                {/* Medical */}
                <section className="border-t border-slate-100 pt-7">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                      <HeartPulse className="h-4 w-4" />
                    </div>

                    <div>
                      <h3 className="font-bold text-[#172B4D]">
                        Medical & Care Information
                      </h3>

                      <p className="text-xs text-slate-500">
                        Relevant information to help caretakers provide
                        safer assistance.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#172B4D]">
                      Medical Conditions
                    </label>

                    <textarea
                      value={form.medicalConditions}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          medicalConditions: e.target.value,
                        }))
                      }
                      rows={3}
                      placeholder="e.g. Diabetes, Hypertension"
                      className="
                        w-full
                        rounded-xl
                        border
                        border-[#DFE1E6]
                        px-4
                        py-3
                        text-sm
                        text-[#172B4D]
                        outline-none
                        transition
                        placeholder:text-slate-400
                        focus:border-[#0052CC]
                        focus:ring-4
                        focus:ring-blue-100/60
                      "
                    />
                  </div>

                  <div className="mt-4">
                    <label className="mb-2 block text-sm font-semibold text-[#172B4D]">
                      Special Requirements
                    </label>

                    <textarea
                      value={form.specialRequirements}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          specialRequirements: e.target.value,
                        }))
                      }
                      rows={3}
                      placeholder="Mobility support, wheelchair assistance, hearing support, etc."
                      className="
                        w-full
                        rounded-xl
                        border
                        border-[#DFE1E6]
                        px-4
                        py-3
                        text-sm
                        text-[#172B4D]
                        outline-none
                        transition
                        placeholder:text-slate-400
                        focus:border-[#0052CC]
                        focus:ring-4
                        focus:ring-blue-100/60
                      "
                    />
                  </div>
                </section>

                {/* Footer */}
                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      border-[#DFE1E6]
                      px-5
                      py-2.5
                      text-sm
                      font-bold
                      text-[#42526E]
                      transition
                      hover:bg-slate-50
                    "
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-[#003898]
                      px-6
                      py-2.5
                      text-sm
                      font-bold
                      text-white
                      shadow-sm
                      transition
                      hover:bg-[#0747A6]
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {editId
                          ? "Update Profile"
                          : "Create Profile"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          PROFILES
      ====================================================== */}

      {loading ? (
        <div className="rounded-2xl border border-[#DFE1E6] bg-white py-24 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF4FF]">
            <Loader2 className="h-6 w-6 animate-spin text-[#0052CC]" />
          </div>

          <p className="mt-4 text-sm font-semibold text-[#42526E]">
            Loading parent profiles...
          </p>
        </div>
      ) : profiles.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#0052CC]">
            <UserRoundPlus className="h-7 w-7" />
          </div>

          <h3 className="mt-5 text-xl font-bold text-[#091E42]">
            No parent profiles yet
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#42526E]">
            Create a parent profile to save personal,
            medical, contact, and emergency information for
            future CareLink+ hospital visits.
          </p>

          <button
            onClick={openNew}
            className="
              mt-6
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-[#0052CC]
              px-6
              py-3
              text-sm
              font-bold
              text-white
              transition
              hover:bg-[#0747A6]
            "
          >
            <Plus className="h-4 w-4" />
            Add Parent Profile
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {profiles.map((p) => (
            <div
              key={p._id}
              className="
                overflow-hidden
                rounded-3xl
                border
                border-[#DFE1E6]
                bg-white
                shadow-sm
                transition
                hover:-translate-y-0.5
                hover:shadow-lg
              "
            >
              {/* Card Header */}
              <div className="border-b border-slate-100 bg-gradient-to-r from-[#F8FAFF] to-white p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#EAF1FF] text-lg font-extrabold text-[#0052CC] ring-4 ring-white">
                      {p.fullName
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-xl font-bold text-[#091E42]">
                          {p.fullName}
                        </h3>

                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" />
                          Active
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#42526E]">
                        {p.age && (
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5" />
                            Age {p.age}
                          </span>
                        )}

                        {p.gender && (
                          <span className="capitalize">
                            {p.gender}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => openEdit(p)}
                      title="Edit parent profile"
                      aria-label={`Edit ${p.fullName}`}
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        text-[#42526E]
                        transition
                        hover:border-blue-200
                        hover:bg-blue-50
                        hover:text-[#0052CC]
                      "
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(p._id)}
                      title="Delete parent profile"
                      aria-label={`Delete ${p.fullName}`}
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-red-100
                        bg-white
                        text-red-500
                        transition
                        hover:border-red-200
                        hover:bg-red-50
                        hover:text-red-600
                      "
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="space-y-6 p-6">

                {/* Contact */}
                <section>
                  <div className="mb-3 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#0052CC]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Contact
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <InfoItem
                      icon={Phone}
                      label="Primary Contact"
                      value={p.contactNumber}
                    />

                    <InfoItem
                      icon={ShieldAlert}
                      label="Emergency Contact"
                      value={
                        p.emergencyContact?.name
                          ? `${p.emergencyContact.name}${
                              p.emergencyContact.phone
                                ? ` · ${p.emergencyContact.phone}`
                                : ""
                            }`
                          : undefined
                      }
                    />
                  </div>
                </section>

                {/* Location */}
                <section className="border-t border-slate-100 pt-5">
                  <div className="mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#0052CC]" />

                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Residential Address
                    </h4>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-sm font-medium leading-6 text-[#42526E]">
                      {p.address}
                      {p.town ? `, ${p.town}` : ""}
                      {p.district
                        ? `, ${p.district}`
                        : ""}
                    </p>
                  </div>
                </section>

                {/* Medical */}
                <section className="border-t border-slate-100 pt-5">
                  <div className="mb-3 flex items-center gap-2">
                    <HeartPulse className="h-4 w-4 text-rose-500" />

                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Medical Information
                    </h4>
                  </div>

                  {p.medicalConditions ? (
                    <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-4">
                      <p className="text-sm leading-6 text-slate-700">
                        {p.medicalConditions}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm italic text-slate-400">
                      No medical conditions recorded.
                    </p>
                  )}
                </section>

                {/* Requirements */}
                <section className="border-t border-slate-100 pt-5">
                  <div className="mb-3 flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-violet-500" />

                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Special Requirements
                    </h4>
                  </div>

                  {p.specialRequirements ? (
                    <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
                      <p className="text-sm leading-6 text-slate-700">
                        {p.specialRequirements}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm italic text-slate-400">
                      No special requirements recorded.
                    </p>
                  )}
                </section>

                {/* Emergency relationship */}
                {p.emergencyContact?.relationship && (
                  <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span>
                      Emergency contact relationship:
                      {" "}
                      <strong>
                        {p.emergencyContact.relationship}
                      </strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-4">
                <div className="flex flex-col gap-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    CareLink+ Parent Profile
                  </span>

                  <span className="inline-flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Available for hospital booking
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
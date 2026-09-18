"use client";

import { useEffect, useRef, useState } from "react";
import {
  Camera,
  CheckCircle2,
  Pencil,
  Shield,
  X,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { authAPI } from "@/services/api";

const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api"
).replace(/\/api\/?$/, "");

/* ============================================================
   RESOLVE PROFILE PHOTO URL
============================================================ */

function resolvePhotoUrl(
  photo?: string | null
) {
  if (!photo) return null;

  if (/^https?:\/\//i.test(photo)) {
    return photo;
  }

  return `${API_ORIGIN}${
    photo.startsWith("/")
      ? photo
      : `/${photo}`
  }`;
}

export default function ClientProfilePage() {
  const {
    user,
    refreshUser,
  } = useAuth();

  const fileRef =
    useRef<HTMLInputElement>(null);

  const previewUrlRef =
    useRef<string | null>(null);

  const [editing, setEditing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [form, setForm] =
    useState({
      name: "",
      email: "",
      phone: "",
    });

  const [photoFile, setPhotoFile] =
    useState<File | null>(null);

  const [photoPreview, setPhotoPreview] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState("");

  const [error, setError] =
    useState("");

  /* ==========================================================
     LOAD USER DATA
  ========================================================== */

  useEffect(() => {
    if (!user) return;

    setForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
    });
  }, [user]);

  /* ==========================================================
     CLEANUP PREVIEW OBJECT URL
  ========================================================== */

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(
          previewUrlRef.current
        );
      }
    };
  }, []);

  /* ==========================================================
     PROFILE PHOTO CHANGE
  ========================================================== */

  const handlePhotoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setError("");
    setSuccess("");

    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      event.target.value = "";

      setError(
        "Please select a JPG, PNG, or WebP image."
      );

      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      event.target.value = "";

      setError(
        "Profile picture must be 5 MB or smaller."
      );

      return;
    }

    if (previewUrlRef.current) {
      URL.revokeObjectURL(
        previewUrlRef.current
      );
    }

    const preview =
      URL.createObjectURL(file);

    previewUrlRef.current =
      preview;

    setPhotoFile(file);
    setPhotoPreview(preview);

    /*
     * Selecting a photo automatically enters
     * edit mode.
     */
    setEditing(true);
  };

  /* ==========================================================
     CLEAR PHOTO SELECTION
  ========================================================== */

  const clearPhotoSelection = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(
        previewUrlRef.current
      );
    }

    previewUrlRef.current = null;

    setPhotoFile(null);
    setPhotoPreview(null);

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  /* ==========================================================
     SAVE PROFILE
  ========================================================== */

  const handleSave = async () => {
    setError("");
    setSuccess("");

    /* --------------------------------------------------------
       Validate name
    --------------------------------------------------------- */

    if (!form.name.trim()) {
      setError(
        "Full name is required."
      );

      return;
    }

    /* --------------------------------------------------------
       Validate email
    --------------------------------------------------------- */

    if (!form.email.trim()) {
      setError(
        "Email address is required."
      );

      return;
    }

    /* --------------------------------------------------------
       Validate email format
    --------------------------------------------------------- */

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailRegex.test(
        form.email.trim()
      )
    ) {
      setError(
        "Please enter a valid email address."
      );

      return;
    }

    setSaving(true);

    try {
      const formData =
        new FormData();

      formData.append(
        "name",
        form.name.trim()
      );

      formData.append(
        "email",
        form.email.trim()
      );

      formData.append(
        "phone",
        form.phone.trim()
      );

      if (photoFile) {
        formData.append(
          "profilePhoto",
          photoFile
        );
      }

      /*
       * IMPORTANT:
       * This is an actual UPDATE request,
       * not GET /auth/me.
       */
      const data =
        await authAPI.updateProfile(
          formData
        );

      /*
       * Keep local auth state synchronized
       * immediately.
       */
      localStorage.setItem(
        "carelink_user",
        JSON.stringify(data.user)
      );

      /*
       * Refresh the authoritative
       * authenticated user.
       */
      await refreshUser();

      clearPhotoSelection();

      setEditing(false);

      setSuccess(
        "Profile updated successfully."
      );
    } catch (e: unknown) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================================
     CANCEL EDITING
  ========================================================== */

  const handleCancel = () => {
    setForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });

    clearPhotoSelection();

    setEditing(false);
    setError("");
    setSuccess("");
  };

  /* ==========================================================
     PHOTO URL / INITIAL
  ========================================================== */

  const currentPhoto =
    photoPreview ||
    resolvePhotoUrl(
      user?.profilePhoto
    );

  const initial =
    user?.name
      ?.charAt(0)
      .toUpperCase() ||
    "U";

  /* ==========================================================
     REUSABLE FORM FIELD
  ========================================================== */

  const field = (
    label: string,
    key: keyof typeof form,
    type = "text",
    required = false
  ) => (
    <div className="space-y-2">
      <label
        className="
          block
          text-sm
          font-medium
          text-[#091E42]
          dark:text-slate-200
        "
      >
        {label}

        {required ? " *" : ""}
      </label>

      {editing ? (
        <input
          type={type}
          value={form[key]}
          required={required}
          disabled={saving}
          onChange={(event) =>
            setForm((previous) => ({
              ...previous,
              [key]:
                event.target.value,
            }))
          }
          className="
            h-12
            w-full
            rounded-xl
            border
            border-slate-200
            bg-slate-50
            px-4
            text-[15px]
            text-[#091E42]
            outline-none
            transition-all
            duration-200
            focus:border-[#003898]
            focus:bg-white
            focus:ring-4
            focus:ring-[#003898]/10

            dark:border-slate-700
            dark:bg-slate-950
            dark:text-slate-100
            dark:focus:border-blue-400
            dark:focus:bg-slate-950
          "
        />
      ) : (
        <div
          className="
            flex
            h-12
            items-center
            rounded-xl
            border
            border-slate-200
            bg-slate-50
            px-4
            text-[15px]
            text-[#091E42]

            dark:border-slate-700
            dark:bg-slate-800
            dark:text-slate-100
          "
        >
          {form[key] || (
            <span className="italic text-slate-400">
              Not set
            </span>
          )}
        </div>
      )}
    </div>
  );

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="max-w-3xl text-left">

      {/* ======================================================
          HEADER
      ======================================================= */}

      <div
        className="
          mb-8
          flex
          flex-col
          justify-between
          gap-4
          sm:flex-row
          sm:items-center
        "
      >
        <div>
          <h1
            className="
              text-4xl
              font-bold
              text-[#091E42]
              dark:text-white
            "
          >
            My Profile
          </h1>

          <p
            className="
              mt-2
              text-gray-500
              dark:text-slate-400
            "
          >
            Manage your personal information
            and profile picture.
          </p>
        </div>

        <div className="flex shrink-0">
          {!editing ? (
            <button
              type="button"
              onClick={() => {
                setError("");
                setSuccess("");
                setEditing(true);
              }}
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-[#003898]
                px-6
                py-3
                text-sm
                font-semibold
                text-white
                shadow-sm
                transition-all
                duration-200
                hover:bg-[#0747A6]
                hover:shadow-lg
              "
            >
              <Pencil className="h-4 w-4" />
              Edit Profile
            </button>
          ) : (
            <div className="flex w-full gap-3 sm:w-auto">

              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="
                  inline-flex
                  flex-1
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-[#64748B]
                  transition-all
                  duration-200
                  hover:bg-slate-50
                  disabled:cursor-not-allowed
                  disabled:opacity-50

                  dark:border-slate-700
                  dark:bg-slate-900
                  dark:text-slate-300
                  dark:hover:bg-slate-800

                  sm:flex-none
                "
              >
                <X className="h-4 w-4" />
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="
                  inline-flex
                  flex-1
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#003898]
                  px-6
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition-all
                  duration-200
                  hover:bg-[#0747A6]
                  hover:shadow-lg
                  disabled:cursor-not-allowed
                  disabled:opacity-50

                  sm:flex-none
                "
              >
                <CheckCircle2 className="h-4 w-4" />

                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>
          )}
        </div>
      </div>

      {/* ======================================================
          SUCCESS
      ======================================================= */}

      {success && (
        <div
          className="
            mb-6
            flex
            items-center
            gap-2
            rounded-2xl
            border
            border-emerald-100
            bg-emerald-50
            p-4
            text-sm
            font-semibold
            text-emerald-800

            dark:border-emerald-900/40
            dark:bg-emerald-950/30
            dark:text-emerald-300
          "
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}

      {/* ======================================================
          ERROR
      ======================================================= */}

      {error && (
        <div
          className="
            mb-6
            flex
            items-center
            gap-2
            rounded-2xl
            border
            border-rose-100
            bg-rose-50
            p-4
            text-sm
            font-semibold
            text-rose-800

            dark:border-rose-900/40
            dark:bg-rose-950/30
            dark:text-rose-300
          "
        >
          <span className="h-2 w-2 shrink-0 rounded-full bg-rose-500" />
          {error}
        </div>
      )}

      {/* ======================================================
          PROFILE PICTURE
      ======================================================= */}

      <div
        className="
          mb-6
          rounded-3xl
          border
          border-slate-200
          bg-white
          p-8
          shadow-sm
          transition-all
          duration-200
          hover:shadow-lg

          dark:border-slate-700
          dark:bg-slate-900
        "
      >
        <div
          className="
            flex
            flex-col
            items-start
            gap-6
            sm:flex-row
            sm:items-center
          "
        >

          {/* Avatar */}
          <div className="relative">

            <div
              className="
                flex
                h-28
                w-28
                items-center
                justify-center
                overflow-hidden
                rounded-full
                bg-[#0052CC]
                text-4xl
                font-bold
                text-white
                ring-4
                ring-blue-100
                shadow-sm

                dark:ring-blue-950
              "
            >
              {currentPhoto ? (
                <img
                  src={currentPhoto}
                  alt={`${user?.name || "User"} profile`}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";
                  }}
                />
              ) : (
                initial
              )}
            </div>

            {/* Camera */}
            {editing && (
              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  fileRef.current?.click()
                }
                className="
                  absolute
                  bottom-0
                  right-0
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-[#003898]
                  text-white
                  shadow-lg
                  ring-4
                  ring-white
                  transition
                  hover:bg-[#0747A6]
                  disabled:cursor-not-allowed
                  disabled:opacity-50

                  dark:ring-slate-900
                "
                title="Change profile picture"
                aria-label="Change profile picture"
              >
                <Camera className="h-5 w-5" />
              </button>
            )}

            {/* Hidden input */}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              className="hidden"
            />

          </div>

          {/* Profile summary */}
          <div className="space-y-2">

            <h2
              className="
                text-xl
                font-bold
                tracking-tight
                text-[#091E42]
                dark:text-white
              "
            >
              {user?.name || "User"}
            </h2>

            <span
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-md
                bg-blue-50
                px-2.5
                py-1
                text-xs
                font-bold
                tracking-wide
                text-[#0052CC]

                dark:bg-blue-950/50
                dark:text-blue-300
              "
            >
              <Shield className="h-3.5 w-3.5 stroke-[2.5]" />
              Family Member
            </span>

            <p
              className="
                max-w-lg
                text-sm
                text-slate-500
                dark:text-slate-400
              "
            >
              {editing
                ? "Choose a JPG, PNG, or WebP image up to 5 MB. Click Save Changes to upload it."
                : "Your profile picture is used across your CareLink+ account."}
            </p>

            {editing && photoFile && (
              <div
                className="
                  flex
                  items-center
                  gap-3
                  text-sm
                  text-slate-600
                  dark:text-slate-300
                "
              >
                <span className="max-w-[220px] truncate">
                  {photoFile.name}
                </span>

                <button
                  type="button"
                  disabled={saving}
                  onClick={clearPhotoSelection}
                  className="
                    text-rose-600
                    hover:text-rose-700
                    dark:text-rose-400
                  "
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================
          PERSONAL INFORMATION
      ======================================================= */}

      <div
        className="
          space-y-6
          rounded-3xl
          border
          border-slate-200
          bg-white
          p-8
          shadow-sm
          transition-all
          duration-200
          hover:shadow-lg

          dark:border-slate-700
          dark:bg-slate-900
        "
      >
        <h3
          className="
            border-b
            border-slate-100
            pb-3
            text-lg
            font-bold
            text-[#091E42]

            dark:border-slate-700
            dark:text-white
          "
        >
          Personal Information
        </h3>

        {field(
          "Full Name",
          "name",
          "text",
          true
        )}

        {field(
          "Email Address",
          "email",
          "email",
          true
        )}

        {field(
          "Phone Number",
          "phone",
          "tel"
        )}

        {/* Account role */}
        <div className="space-y-2">

          <label
            className="
              block
              text-sm
              font-medium
              text-[#091E42]
              dark:text-slate-200
            "
          >
            Account Role
          </label>

          <div
            className="
              flex
              h-12
              items-center
              gap-2
              rounded-xl
              border
              border-slate-200/60
              bg-[#F4F8FF]
              px-4
              text-[15px]
              font-semibold
              text-[#003898]

              dark:border-slate-700
              dark:bg-blue-950/30
              dark:text-blue-300
            "
          >
            <Shield className="h-4 w-4 stroke-[2.5]" />
            Family Member
          </div>
        </div>
      </div>

    </div>
  );
}
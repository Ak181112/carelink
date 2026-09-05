"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Search,
  ShieldAlert,
  Trash2,
  UserCheck,
  UserX,
  X,
} from "lucide-react";

import { adminAPI } from "@/services/api";
import { User } from "@/types";

/* ============================================================
   TYPES
============================================================ */

interface AdminUser extends User {
  _id?: string;
  isActive?: boolean;
  createdAt?: string;
}

type ConfirmAction =
  | {
      type: "activate";
      userId: string;
      userName: string;
    }
  | {
      type: "deactivate";
      userId: string;
      userName: string;
    }
  | {
      type: "delete";
      userId: string;
      userName: string;
    }
  | null;

/* ============================================================
   COMPONENT
============================================================ */

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState("");

  const [actionLoading, setActionLoading] =
    useState<string | null>(null);

  const [confirmAction, setConfirmAction] =
    useState<ConfirmAction>(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* ==========================================================
     LOAD USERS
  ========================================================== */

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const params: {
        role?: string;
        search?: string;
      } = {};

      if (roleFilter) {
        params.role = roleFilter;
      }

      if (search.trim()) {
        params.search = search.trim();
      }

      const data =
        await adminAPI.getUsers(params);

      setUsers(
        (data.users || []) as AdminUser[]
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     INITIAL / ROLE FILTER LOAD
  ========================================================== */

  useEffect(() => {
    load();
    // Search is intentionally not included here.
    // It is executed by pressing Search/Enter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  /* ==========================================================
     CLEAR MESSAGES
  ========================================================== */

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  /* ==========================================================
     OPEN CONFIRMATION
  ========================================================== */

  const openConfirmation = (
    action: ConfirmAction
  ) => {
    clearMessages();
    setConfirmAction(action);
  };

  /* ==========================================================
     CLOSE CONFIRMATION
  ========================================================== */

  const closeConfirmation = () => {
    if (actionLoading) return;

    setConfirmAction(null);
  };

  /* ==========================================================
     CONFIRMED ACTION
  ========================================================== */

  const handleConfirmedAction =
    async () => {
      if (!confirmAction) return;

      const {
        type,
        userId,
        userName,
      } = confirmAction;

      setActionLoading(userId);
      clearMessages();

      try {
        /* ------------------------------------------------------
           ACTIVATE
        ------------------------------------------------------- */

        if (type === "activate") {
          await adminAPI.toggleUserStatus(
            userId
          );

          setSuccess(
            `${userName} has been activated successfully.`
          );
        }

        /* ------------------------------------------------------
           DEACTIVATE
        ------------------------------------------------------- */

        if (type === "deactivate") {
          await adminAPI.toggleUserStatus(
            userId
          );

          setSuccess(
            `${userName} has been deactivated successfully.`
          );
        }

        /* ------------------------------------------------------
           DELETE
        ------------------------------------------------------- */

        if (type === "delete") {
          await adminAPI.deleteUser(
            userId
          );

          setSuccess(
            `${userName} has been deleted successfully.`
          );
        }

        /* ------------------------------------------------------
           Close modal
        ------------------------------------------------------- */

        setConfirmAction(null);

        /* ------------------------------------------------------
           Reload server data
        ------------------------------------------------------- */

        await load();
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : `Failed to ${type} user.`
        );
      } finally {
        setActionLoading(null);
      }
    };

  /* ==========================================================
     ROLE BADGE
  ========================================================== */

  const roleBadge = (
    role: string
  ) => {
    const map: Record<
      string,
      string
    > = {
      family_member:
        "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",

      caretaker:
        "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300",

      admin:
        "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300",
    };

    const labels: Record<
      string,
      string
    > = {
      family_member: "Family",
      caretaker: "Caretaker",
      admin: "Admin",
    };

    return (
      <span
        className={`
          rounded-full
          px-2.5
          py-1
          text-xs
          font-medium
          ${
            map[role] ||
            "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300"
          }
        `}
      >
        {labels[role] || role}
      </span>
    );
  };

  /* ==========================================================
     CONFIRMATION CONTENT
  ========================================================== */

  const confirmationContent =
    () => {
      if (!confirmAction) {
        return null;
      }

      const isDelete =
        confirmAction.type ===
        "delete";

      const isDeactivate =
        confirmAction.type ===
        "deactivate";

      const isActivate =
        confirmAction.type ===
        "activate";

      return {
        title: isDelete
          ? "Delete User"
          : isDeactivate
          ? "Deactivate User"
          : "Activate User",

        description: isDelete
          ? `Are you sure you want to permanently delete "${confirmAction.userName}"?`
          : isDeactivate
          ? `Are you sure you want to deactivate "${confirmAction.userName}"?`
          : `Are you sure you want to activate "${confirmAction.userName}"?`,

        detail: isDelete
          ? "This action cannot be undone. The user's account will be permanently removed."
          : isDeactivate
          ? "The user will no longer be able to access their CareLink+ account."
          : "The user will be able to access their CareLink+ account again.",

        buttonLabel: isDelete
          ? "Delete User"
          : isDeactivate
          ? "Deactivate"
          : "Activate",

        buttonClass: isDelete
          ? "bg-red-600 hover:bg-red-700 focus:ring-red-500/30"
          : isDeactivate
          ? "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500/30"
          : "bg-[#0052CC] hover:bg-[#0747A6] focus:ring-blue-500/30",
      };
    };

  const modalContent =
    confirmationContent();

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <>
      {/* ======================================================
          MAIN PAGE
      ======================================================= */}

      <div className="text-left">

        {/* ====================================================
            PAGE HEADER
        ===================================================== */}

        <div className="mb-8">
          <h1
            className="
              text-3xl
              font-bold
              text-[#091E42]
              dark:text-yellow-200
            "
          >
            User Management
          </h1>

          <p
            className="
              mt-1
              text-[#42526E]
              dark:text-yellow-200
            "
          >
            View and manage all registered users
          </p>
        </div>

        {/* ====================================================
            SUCCESS MESSAGE
        ===================================================== */}

        {success && (
          <div
            className="
              mb-6
              flex
              items-start
              gap-3
              rounded-2xl
              border
              border-emerald-200
              bg-emerald-50
              p-4
              text-sm
              font-semibold
              text-emerald-800
              dark:border-emerald-900/50
              dark:bg-emerald-950/30
              dark:text-emerald-300
            "
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

            <span>{success}</span>

            <button
              type="button"
              onClick={() =>
                setSuccess("")
              }
              className="ml-auto rounded-lg p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
              aria-label="Dismiss success message"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ====================================================
            ERROR MESSAGE
        ===================================================== */}

        {error && (
          <div
            className="
              mb-6
              flex
              items-start
              gap-3
              rounded-2xl
              border
              border-red-200
              bg-red-50
              p-4
              text-sm
              font-semibold
              text-red-800
              dark:border-red-900/50
              dark:bg-red-950/30
              dark:text-red-300
            "
          >
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />

            <span>{error}</span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="ml-auto rounded-lg p-1 hover:bg-red-100 dark:hover:bg-red-900/30"
              aria-label="Dismiss error message"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ====================================================
            FILTERS
        ===================================================== */}

        <div
          className="
            mb-6
            flex
            flex-col
            gap-4
            rounded-2xl
            border
            border-[#DFE1E6]
            bg-white
            p-5
            dark:border-slate-700
            dark:bg-slate-900
            sm:flex-row
          "
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search
              className="
                pointer-events-none
                absolute
                left-3
                top-1/2
                h-4
                w-4
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              placeholder="Search by name or email..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  load();
                }
              }}
              className="
                h-11
                w-full
                rounded-xl
                border
                border-[#DFE1E6]
                bg-white
                pl-10
                pr-4
                text-sm
                text-[#091E42]
                outline-none
                transition
                focus:border-[#0052CC]
                dark:border-slate-700
                dark:bg-slate-950
                dark:text-slate-100
              "
            />
          </div>

          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(event.target.value)
            }
            className="
              h-11
              rounded-xl
              border
              border-[#DFE1E6]
              bg-white
              px-4
              text-sm
              text-[#091E42]
              outline-none
              transition
              focus:border-[#0052CC]
              dark:border-slate-700
              dark:bg-slate-950
              dark:text-slate-100
              sm:w-44
            "
          >
            <option value="">
              All Roles
            </option>

            <option value="family_member">
              Family Members
            </option>

            <option value="caretaker">
              Caretakers
            </option>

            <option value="admin">
              Admins
            </option>
          </select>

          {/* Search button */}
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="
              flex
              h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-[#0052CC]
              px-6
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-[#0747A6]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}

            Search
          </button>
        </div>

        {/* ====================================================
            USERS TABLE
        ===================================================== */}

        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-[#DFE1E6]
            bg-white
            dark:border-slate-700
            dark:bg-slate-900
          "
        >
          {loading ? (
            <div
              className="
                flex
                flex-col
                items-center
                justify-center
                py-16
                text-[#42526E]
                dark:text-yellow-200
              "
            >
              <Loader2 className="mb-3 h-7 w-7 animate-spin" />

              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="py-16 text-center">
              <span className="text-5xl">
                👥
              </span>

              <p
                className="
                  mt-3
                  text-[#42526E]
                  dark:text-yellow-200
                "
              >
                No users found
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead
                  className="
                    border-b
                    border-[#DFE1E6]
                    bg-[#F8FAFC]
                    dark:border-slate-700
                    dark:bg-slate-800
                  "
                >
                  <tr>
                    {[
                      "Name",
                      "Email",
                      "Role",
                      "Status",
                      "Joined",
                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="
                          px-5
                          py-3.5
                          text-left
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wider
                          text-[#42526E]
                          dark:text-yellow-200
                        "
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#DFE1E6] dark:divide-slate-700">
                  {users.map((user) => {
                    const userId =
                      user._id ||
                      user.id;

                    const isActive =
                      user.isActive !==
                      false;

                    return (
                      <tr
                        key={userId}
                        className="
                          transition
                          hover:bg-[#F8FAFC]
                          dark:hover:bg-slate-800/70
                        "
                      >
                        {/* Name */}
                        <td
                          className="
                            px-5
                            py-4
                            font-medium
                            text-[#091E42]
                            dark:text-yellow-200
                          "
                        >
                          <div className="flex items-center gap-2.5">

                            <div
                              className="
                                flex
                                h-8
                                w-8
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                bg-[#EEF4FF]
                                text-xs
                                font-bold
                                text-[#0052CC]
                                dark:bg-blue-950/50
                                dark:text-blue-300
                              "
                            >
                              {user.name
                                ?.charAt(0)
                                .toUpperCase()}
                            </div>

                            <span className="max-w-[220px] truncate">
                              {user.name}
                            </span>
                          </div>
                        </td>

                        {/* Email */}
                        <td
                          className="
                            px-5
                            py-4
                            text-[#42526E]
                            dark:text-yellow-200
                          "
                        >
                          {user.email}
                        </td>

                        {/* Role */}
                        <td className="px-5 py-4">
                          {roleBadge(
                            user.role
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`
                              rounded-full
                              px-2.5
                              py-1
                              text-xs
                              font-medium
                              ${
                                isActive
                                  ? "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300"
                                  : "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-300"
                              }
                            `}
                          >
                            {isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        {/* Joined */}
                        <td
                          className="
                            px-5
                            py-4
                            text-xs
                            text-[#42526E]
                            dark:text-yellow-200
                          "
                        >
                          {user.createdAt
                            ? new Date(
                                user.createdAt
                              ).toLocaleDateString()
                            : "—"}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">

                            {/* Activate / Deactivate */}
                            <button
                              type="button"
                              disabled={
                                actionLoading ===
                                userId
                              }
                              onClick={() =>
                                openConfirmation(
                                  {
                                    type:
                                      isActive
                                        ? "deactivate"
                                        : "activate",

                                    userId,

                                    userName:
                                      user.name,
                                  }
                                )
                              }
                              className={`
                                inline-flex
                                items-center
                                gap-1.5
                                rounded-lg
                                border
                                px-3
                                py-1.5
                                text-xs
                                font-medium
                                transition
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                                ${
                                  isActive
                                    ? "border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-900/50 dark:text-amber-300 dark:hover:bg-amber-950/30"
                                    : "border-green-200 text-green-700 hover:bg-green-50 dark:border-green-900/50 dark:text-green-300 dark:hover:bg-green-950/30"
                                }
                              `}
                            >
                              {isActive ? (
                                <UserX className="h-3.5 w-3.5" />
                              ) : (
                                <UserCheck className="h-3.5 w-3.5" />
                              )}

                              {isActive
                                ? "Deactivate"
                                : "Activate"}
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              disabled={
                                actionLoading ===
                                userId
                              }
                              onClick={() =>
                                openConfirmation(
                                  {
                                    type: "delete",
                                    userId,
                                    userName:
                                      user.name,
                                  }
                                )
                              }
                              className="
                                inline-flex
                                items-center
                                gap-1.5
                                rounded-lg
                                border
                                border-red-200
                                px-3
                                py-1.5
                                text-xs
                                font-medium
                                text-red-600
                                transition
                                hover:bg-red-50
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                                dark:border-red-900/50
                                dark:text-red-400
                                dark:hover:bg-red-950/30
                              "
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>

                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          CONFIRMATION MODAL
      ========================================================= */}

      {confirmAction &&
        modalContent && (
          <div
            className="
              fixed
              inset-0
              z-[100]
              flex
              items-center
              justify-center
              bg-black/50
              px-4
              py-6
              backdrop-blur-sm
            "
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-action-title"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget &&
                !actionLoading
              ) {
                closeConfirmation();
              }
            }}
          >
            <div
              className="
                w-full
                max-w-md
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-2xl
                dark:border-slate-700
                dark:bg-slate-900
              "
              onMouseDown={(event) =>
                event.stopPropagation()
              }
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4 p-6">

                <div className="flex items-start gap-3">

                  <div
                    className={`
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      ${
                        confirmAction.type ===
                        "delete"
                          ? "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400"
                          : confirmAction.type ===
                            "deactivate"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                          : "bg-blue-100 text-[#0052CC] dark:bg-blue-950/50 dark:text-blue-300"
                      }
                    `}
                  >
                    {confirmAction.type ===
                    "delete" ? (
                      <Trash2 className="h-5 w-5" />
                    ) : confirmAction.type ===
                      "deactivate" ? (
                      <UserX className="h-5 w-5" />
                    ) : (
                      <UserCheck className="h-5 w-5" />
                    )}
                  </div>

                  <div>
                    <h2
                      id="user-action-title"
                      className="
                        text-lg
                        font-bold
                        text-slate-900
                        dark:text-yellow-200
                      "
                    >
                      {modalContent.title}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Please confirm this action.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={
                    closeConfirmation
                  }
                  disabled={actionLoading !== null}
                  aria-label="Close confirmation dialog"
                  className="
                    rounded-lg
                    p-2
                    text-slate-400
                    transition
                    hover:bg-slate-100
                    hover:text-slate-600
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    dark:hover:bg-slate-800
                    dark:hover:text-slate-200
                  "
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-6">

                <div
                  className="
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    p-4
                    dark:border-slate-700
                    dark:bg-slate-800
                  "
                >
                  <p
                    className="
                      text-sm
                      leading-6
                      text-slate-700
                      dark:text-slate-200
                    "
                  >
                    {modalContent.description}
                  </p>

                  <p
                    className={`
                      mt-3
                      text-sm
                      font-medium
                      ${
                        confirmAction.type ===
                        "delete"
                          ? "text-red-600 dark:text-red-400"
                          : "text-slate-500 dark:text-slate-400"
                      }
                    `}
                  >
                    {modalContent.detail}
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 p-6">

                <button
                  type="button"
                  disabled={
                    actionLoading !== null
                  }
                  onClick={
                    closeConfirmation
                  }
                  className="
                    rounded-xl
                    border
                    border-slate-300
                    bg-white
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-slate-700
                    transition
                    hover:bg-slate-50
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    dark:border-slate-700
                    dark:bg-slate-800
                    dark:text-slate-200
                    dark:hover:bg-slate-700
                  "
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    actionLoading !== null
                  }
                  onClick={
                    handleConfirmedAction
                  }
                  className={`
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    shadow-sm
                    transition
                    focus:outline-none
                    focus:ring-4
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                    ${modalContent.buttonClass}
                  `}
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : confirmAction.type ===
                    "delete" ? (
                    <Trash2 className="h-4 w-4" />
                  ) : confirmAction.type ===
                    "deactivate" ? (
                    <UserX className="h-4 w-4" />
                  ) : (
                    <UserCheck className="h-4 w-4" />
                  )}

                  {actionLoading
                    ? "Processing..."
                    : modalContent.buttonLabel}
                </button>
              </div>
            </div>
          </div>
        )}
    </>
  );
}
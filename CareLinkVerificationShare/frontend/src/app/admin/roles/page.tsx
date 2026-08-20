"use client";

import { useCallback, useState } from "react";
import { adminAPI } from "@/services/api";
import { useApiData } from "@/lib/useApiData";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/types";

type ManagedUser = User & { _id: string; createdAt: string };

const ROLES = [
  {
    key: "family_member",
    name: "Family Member (Client)",
    icon: "👨‍👩‍👧",
    card: "bg-blue-50 border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    permissions: [
      "Create parent profiles",
      "Browse approved caretakers",
      "Book, cancel and pay for hospital visits",
      "Rate a caretaker after a completed visit",
      "Raise an emergency during a visit",
    ],
  },
  {
    key: "caretaker",
    name: "Caretaker",
    icon: "🩺",
    card: "bg-green-50 border-green-200",
    badge: "bg-green-100 text-green-700",
    permissions: [
      "Complete a profile and upload NIC documents",
      "Submit an application for approval",
      "Accept or decline booking requests",
      "Verify the pickup OTP and run a visit",
      "Set their own availability",
    ],
  },
  {
    key: "admin",
    name: "Administrator",
    icon: "🛡️",
    card: "bg-purple-50 border-purple-200",
    badge: "bg-purple-100 text-purple-700",
    permissions: [
      "Approve or reject caretaker applications",
      "Override a failed OCR address match",
      "Manage users, roles and platform settings",
      "Handle payments, refunds and emergencies",
      "View reports and analytics",
    ],
  },
];

export default function AdminRolesPage() {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  // Admins are hidden from the normal user list; role management needs them so
  // the counts are honest and another admin can be demoted.
  const fetchUsers = useCallback(
    () => adminAPI.getUsers({ includeAdmins: "true" }),
    [],
  );
  const { data, loading, reload } = useApiData(fetchUsers);
  const users: ManagedUser[] = data?.users ?? [];

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  const term = search.toLowerCase();
  const filtered = users.filter(
    (u) =>
      !term || u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term),
  );

  const countByRole = (key: string) => users.filter((u) => u.role === key).length;

  const handleRoleChange = async (u: ManagedUser, role: string) => {
    const label = ROLES.find((r) => r.key === role)?.name ?? role;

    if (!confirm(`Change ${u.name} to ${label}? They will be notified.`)) return;

    setBusyId(u._id);
    try {
      await adminAPI.changeUserRole(u._id, role);
      showToast(`${u.name} is now a ${label}`);
      reload();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Could not change the role");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      {toast && (
        <div className="fixed right-6 top-6 z-50 rounded-2xl bg-[#091E42] px-5 py-3 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#091E42]">Role Management</h1>
        <p className="mt-1 text-[#42526E]">
          What each role can do, and who currently holds it.
        </p>
      </div>

      <div className="mb-6 rounded-2xl border border-[#C7D9FF] bg-[#EEF4FF] p-5 text-sm text-[#42526E]">
        ℹ️ New users can only register as Family Members or Caretakers. Promoting
        somebody to Administrator gives them full access to the platform — including
        payments, refunds and other users&apos; data.
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {ROLES.map((role) => (
          <div key={role.key} className={`rounded-2xl border-2 bg-white p-6 ${role.card}`}>
            <div className="mb-5 flex items-center gap-3">
              <span className="text-3xl">{role.icon}</span>
              <div>
                <h3 className="font-bold text-[#091E42]">{role.name}</h3>
                <div className="mt-1 flex items-center gap-2">
                  <code className="rounded bg-white/80 px-2 py-0.5 text-xs text-[#42526E]">
                    {role.key}
                  </code>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${role.badge}`}
                  >
                    {loading ? "—" : countByRole(role.key)}
                  </span>
                </div>
              </div>
            </div>

            <h4 className="mb-3 text-sm font-semibold text-[#091E42]">Permissions:</h4>
            <ul className="space-y-2">
              {role.permissions.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-[#42526E]">
                  <span className="mt-0.5 text-green-500" aria-hidden>
                    ✓
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mb-6 rounded-2xl border border-[#DFE1E6] bg-white p-5">
        <input
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 w-full rounded-xl border border-[#DFE1E6] px-4 text-sm outline-none focus:border-[#0052CC]"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#DFE1E6] bg-white">
        <div className="border-b border-[#DFE1E6] px-6 py-4">
          <h2 className="font-bold text-[#091E42]">Assign roles</h2>
          <p className="mt-0.5 text-sm text-[#6B7280]">
            Changing a role takes effect the next time that user loads the app.
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-[#42526E]">Loading users...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-[#42526E]">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[#DFE1E6] bg-[#F8FAFC]">
                <tr>
                  {["User", "Email", "Current role", "Change to"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#42526E]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#DFE1E6]">
                {filtered.map((u) => {
                  const role = ROLES.find((r) => r.key === u.role);
                  const isSelf = u._id === currentUser?.id;

                  return (
                    <tr key={u._id} className="hover:bg-[#F8FAFC]">
                      <td className="px-5 py-4 font-medium text-[#091E42]">
                        {u.name}
                        {isSelf && (
                          <span className="ml-2 rounded-full bg-[#EEF4FF] px-2 py-0.5 text-xs text-[#0052CC]">
                            you
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-[#42526E]">{u.email}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            role?.badge ?? "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {role?.name ?? u.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {isSelf ? (
                          <span className="text-xs text-[#6B7280]">
                            You cannot change your own role
                          </span>
                        ) : (
                          <select
                            value={u.role}
                            disabled={busyId === u._id}
                            onChange={(e) => handleRoleChange(u, e.target.value)}
                            className="h-9 rounded-lg border border-[#DFE1E6] px-3 text-sm outline-none focus:border-[#0052CC] disabled:opacity-60"
                          >
                            {ROLES.map((r) => (
                              <option key={r.key} value={r.key}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                        )}
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
  );
}

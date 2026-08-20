"use client";

import { useCallback, useState } from "react";
import { adminAPI } from "@/services/api";
import { useApiData } from "@/lib/useApiData";
import { User } from "@/types";

// Extra fields the admin list needs that the shared User type does not carry
type AdminUser = User & { _id: string; isActive?: boolean; createdAt: string };

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  // only applied when the user presses Search / Enter, so typing does not refetch
  const [appliedSearch, setAppliedSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = useCallback(() => {
    const params: { role?: string; search?: string } = {};
    if (roleFilter) params.role = roleFilter;
    if (appliedSearch) params.search = appliedSearch;
    return adminAPI.getUsers(params);
  }, [roleFilter, appliedSearch]);

  const { data, loading, reload, mutate } = useApiData(fetchUsers);
  const users: AdminUser[] = data?.users ?? [];

  const load = () => {
    if (appliedSearch === search) reload();
    else setAppliedSearch(search);
  };

  const handleToggle = async (id: string) => {
    setActionLoading(id);
    try {
      await adminAPI.toggleUserStatus(id);
      reload();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to update user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await adminAPI.deleteUser(id);
      mutate((current) =>
        current
          ? { ...current, users: (current.users as AdminUser[]).filter((u) => u._id !== id) }
          : current,
      );
    } catch (e: unknown) { alert(e instanceof Error ? e.message : "Failed to delete"); }
  };

  const roleBadge = (role: string) => {
    const map: Record<string, string> = {
      family_member: "bg-blue-100 text-blue-700",
      caretaker: "bg-green-100 text-green-700",
      admin: "bg-purple-100 text-purple-700",
    };
    const labels: Record<string, string> = { family_member: "Family", caretaker: "Caretaker", admin: "Admin" };
    return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${map[role] || "bg-gray-100"}`}>{labels[role] || role}</span>;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#091E42]">User Management</h1>
        <p className="mt-1 text-[#42526E]">View and manage all registered users</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#DFE1E6] p-5 mb-6 flex flex-col sm:flex-row gap-4">
        <input placeholder="Search by name or email..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          className="flex-1 h-11 rounded-xl border border-[#DFE1E6] px-4 text-sm outline-none focus:border-[#0052CC]"
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className="h-11 rounded-xl border border-[#DFE1E6] px-4 text-sm outline-none focus:border-[#0052CC] sm:w-44">
          <option value="">All Roles</option>
          <option value="family_member">Family Members</option>
          <option value="caretaker">Caretakers</option>
        </select>
        <button onClick={load}
          className="h-11 rounded-xl bg-[#0052CC] px-6 text-sm font-semibold text-white hover:bg-[#0747A6]">
          Search
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#DFE1E6] overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-[#42526E]">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl">👥</span>
            <p className="mt-3 text-[#42526E]">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFC] border-b border-[#DFE1E6]">
                <tr>
                  {["Name", "Email", "Role", "Status", "Joined", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-[#42526E] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE1E6]">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-[#F8FAFC] transition">
                    <td className="px-5 py-4 font-medium text-[#091E42]">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-[#EEF4FF] flex items-center justify-center text-xs font-bold text-[#0052CC]">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        {u.name}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#42526E]">{u.email}</td>
                    <td className="px-5 py-4">{roleBadge(u.role)}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${u.isActive !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                        {u.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#42526E] text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleToggle(u._id)} disabled={actionLoading === u._id}
                          className="rounded-lg border border-[#DFE1E6] px-3 py-1.5 text-xs font-medium text-[#091E42] hover:bg-gray-50 disabled:opacity-50">
                          {u.isActive !== false ? "Deactivate" : "Activate"}
                        </button>
                        <button onClick={() => handleDelete(u._id, u.name)}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

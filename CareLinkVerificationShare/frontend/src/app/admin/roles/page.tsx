"use client";

export default function AdminRolesPage() {
  const roles = [
    {
      name: "Family Member (Client)", key: "family_member", icon: "👨‍👩‍👧", color: "bg-blue-50 border-blue-200",
      permissions: ["Create/edit own profile", "Create parent profiles", "View approved caretakers", "Receive notifications", "Update contact information"],
    },
    {
      name: "Caretaker", key: "caretaker", icon: "🩺", color: "bg-green-50 border-green-200",
      permissions: ["Complete caretaker profile", "Upload documents (NIC, License, Certs)", "Submit application for approval", "View application status", "Receive notifications"],
    },
    {
      name: "Administrator", key: "admin", icon: "🛡️", color: "bg-purple-50 border-purple-200",
      permissions: ["Full platform access", "Approve/reject caretaker applications", "Manage all users", "View all notifications", "System settings management", "Role management"],
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#091E42]">Role Management</h1>
        <p className="mt-1 text-[#42526E]">Overview of system roles and their permissions</p>
      </div>

      <div className="mb-6 rounded-2xl bg-[#EEF4FF] border border-[#C7D9FF] p-5 text-sm text-[#42526E]">
        ℹ️ Admin accounts are not publicly assignable. New users can only register as Family Members or Caretakers. Admin roles must be assigned directly in the database.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div key={role.key} className={`bg-white rounded-2xl border-2 p-6 ${role.color}`}>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-3xl">{role.icon}</span>
              <div>
                <h3 className="font-bold text-[#091E42]">{role.name}</h3>
                <code className="text-xs text-[#42526E] bg-white/80 rounded px-2 py-0.5">{role.key}</code>
              </div>
            </div>
            <h4 className="text-sm font-semibold text-[#091E42] mb-3">Permissions:</h4>
            <ul className="space-y-2">
              {role.permissions.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-[#42526E]">
                  <span className="text-green-500 mt-0.5">✓</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

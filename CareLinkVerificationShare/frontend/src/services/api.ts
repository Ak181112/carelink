const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("carelink_token");
};

const request = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

const requestFormData = async (endpoint: string, formData: FormData, method = "POST") => {
  const token = getToken();

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

// Auth
export const authAPI = {
  register: (data: { name: string; email: string; password: string; phone?: string; role: string }) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(data) }),

  getMe: () => request("/auth/me"),

  forgotPassword: (email: string) =>
    request("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),

  resetPassword: (token: string, password: string) =>
    request(`/auth/reset-password/${token}`, { method: "POST", body: JSON.stringify({ password }) }),

  verifyEmail: (token: string) =>
    request(`/auth/verify-email/${token}`),
};

// Parent Profiles
export const parentAPI = {
  getAll: () => request("/parent/"),
  getOne: (id: string) => request(`/parent/${id}`),
  create: (data: object) => request("/parent/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: object) => request(`/parent/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => request(`/parent/${id}`, { method: "DELETE" }),
};

// Caretaker
export const caretakerAPI = {
  getMyProfile: () => request("/caretaker/profile"),

  createOrUpdateProfile: (formData: FormData, isUpdate = false) =>
    requestFormData("/caretaker/profile", formData, isUpdate ? "PUT" : "POST"),

  uploadDocuments: (formData: FormData) =>
    requestFormData("/caretaker/upload-documents", formData),

  submitApplication: (formData: FormData) =>
    requestFormData("/caretaker/apply", formData),

  getApplicationStatus: () => request("/caretaker/status"),

  getMyApplication: () => request("/caretaker/my-application"),

  getApproved: (params?: { town?: string; experience?: string }) => {
    const query = params
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
      : "";
    return request(`/caretaker/approved${query}`);
  },

  getById: (id: string) => request(`/caretaker/view/${id}`),
};

// Admin
export const adminAPI = {
  // Dashboard
  getDashboard: () => request("/admin/dashboard"),

  // Users
  getUsers: (params?: { role?: string; search?: string }) => {
    const query = params
      ? `?${new URLSearchParams(
          params as Record<string, string>
        ).toString()}`
      : "";

    return request(`/admin/users${query}`);
  },

  getUserById: (id: string) =>
    request(`/admin/users/${id}`),

  toggleUserStatus: (id: string) =>
    request(`/admin/users/${id}/toggle-status`, {
      method: "PUT",
    }),

  deleteUser: (id: string) =>
    request(`/admin/users/${id}`, {
      method: "DELETE",
    }),

  // Caretaker Applications
  getApplications: (status?: string) => {
    const query = status ? `?status=${status}` : "";

    return request(`/admin/applications${query}`);
  },

  getApplicationById: (id: string) =>
    request(`/admin/applications/${id}`),

  approveApplication: (
    id: string,
    note?: string
  ) =>
    request(`/admin/applications/${id}/approve`, {
      method: "PUT",
      body: JSON.stringify({ note }),
    }),

  rejectApplication: (
    id: string,
    note?: string
  ) =>
    request(`/admin/applications/${id}/reject`, {
      method: "PUT",
      body: JSON.stringify({ note }),
    }),

  // OCR Verification
  getVerificationResults: () =>
    request("/admin/verifications"),

  getVerificationById: (id: string) =>
    request(`/admin/verifications/${id}`),

  // Notifications
  getNotifications: () =>
    request("/admin/notifications"),

  markNotificationRead: (id: string) =>
    request(`/admin/notifications/${id}/read`, {
      method: "PUT",
    }),

  // Statistics
  getStatistics: () =>
    request("/admin/statistics"),
};

// Notifications
export const notificationAPI = {
  getAll: () => request("/notifications/"),
  markAsRead: (id: string) => request(`/notifications/read/${id}`, { method: "PUT" }),
  markAllAsRead: () => request("/notifications/read-all", { method: "PUT" }),
  delete: (id: string) => request(`/notifications/${id}`, { method: "DELETE" }),
};

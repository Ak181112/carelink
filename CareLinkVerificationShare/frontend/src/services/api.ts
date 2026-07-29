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

  updateMe: (data: { name?: string; phone?: string }) =>
    request("/auth/me", { method: "PUT", body: JSON.stringify(data) }),

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

  updateAvailability: (isAvailable: boolean) =>
    request("/caretaker/availability", { method: "PUT", body: JSON.stringify({ isAvailable }) }),

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

  addReview: (id: string, data: { rating: number; comment: string }) =>
    request(`/caretaker/${id}/reviews`, { method: "POST", body: JSON.stringify(data) }),

  deleteReview: (id: string) =>
    request(`/caretaker/${id}/reviews`, { method: "DELETE" }),
};

// Admin
export const adminAPI = {
  // Dashboard
  getDashboard: () => request("/admin/dashboard"),

  // Users
  getUsers: (params?: { role?: string; search?: string; includeAdmins?: string }) => {
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

  // `override` + `overrideReason` are required only when the OCR address
  // did not match the profile address
  approveApplication: (
    id: string,
    note?: string,
    override?: { override: boolean; overrideReason: string }
  ) =>
    request(`/admin/applications/${id}/approve`, {
      method: "PUT",
      body: JSON.stringify({ note, ...override }),
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

  // Contact Messages
  getContactMessages: () =>
    request("/admin/contact-messages"),

  markNotificationRead: (id: string) =>
    request(`/admin/notifications/${id}/read`, {
      method: "PUT",
    }),

  // Statistics
  getStatistics: () =>
    request("/admin/statistics"),

  // Reviews left by clients, flattened across every caretaker profile
  getReviews: (params?: { rating?: string; search?: string }) => {
    const query = params
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
      : "";
    return request(`/admin/reviews${query}`);
  },

  // Emergency monitoring
  getEmergencies: (resolved?: "true" | "false") =>
    request(`/admin/emergencies${resolved ? `?resolved=${resolved}` : ""}`),

  resolveEmergency: (id: string, note: string) =>
    request(`/admin/emergencies/${id}/resolve`, {
      method: "PUT",
      body: JSON.stringify({ note }),
    }),

  // Reports & analytics
  getReports: (months = 6) => request(`/admin/reports?months=${months}`),

  // Role management
  changeUserRole: (id: string, role: string) =>
    request(`/admin/users/${id}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    }),

  // Platform settings
  getSettings: () => request("/admin/settings"),

  updateSettings: (data: object) =>
    request("/admin/settings", { method: "PUT", body: JSON.stringify(data) }),
};

// Bookings
export const bookingAPI = {
  // client
  create: (data: object) =>
    request("/bookings", { method: "POST", body: JSON.stringify(data) }),

  getMine: (status?: string) =>
    request(`/bookings/my${status ? `?status=${status}` : ""}`),

  cancel: (id: string, reason: string) =>
    request(`/bookings/${id}/cancel`, { method: "PUT", body: JSON.stringify({ reason }) }),

  // caretaker
  getAssigned: (status?: string) =>
    request(`/bookings/assigned${status ? `?status=${status}` : ""}`),

  accept: (id: string) => request(`/bookings/${id}/accept`, { method: "PUT" }),

  reject: (id: string, reason: string) =>
    request(`/bookings/${id}/reject`, { method: "PUT", body: JSON.stringify({ reason }) }),

  start: (id: string, otp: string) =>
    request(`/bookings/${id}/start`, { method: "PUT", body: JSON.stringify({ otp }) }),

  complete: (id: string) => request(`/bookings/${id}/complete`, { method: "PUT" }),

  // shared
  getById: (id: string) => request(`/bookings/${id}`),

  triggerEmergency: (id: string, message: string) =>
    request(`/bookings/${id}/emergency`, { method: "PUT", body: JSON.stringify({ message }) }),

  // admin
  getAll: (status?: string) => request(`/bookings${status ? `?status=${status}` : ""}`),

  updatePayment: (id: string, paymentStatus: string) =>
    request(`/bookings/${id}/payment`, {
      method: "PUT",
      body: JSON.stringify({ paymentStatus }),
    }),
};

// Payments (PayHere)
export const paymentAPI = {
  // tells the UI whether card payments are switched on for this server
  getConfig: () => request("/payments/config"),

  // returns { action, fields } — a signed field set the browser POSTs to PayHere
  createCheckout: (bookingId: string) =>
    request(`/payments/checkout/${bookingId}`, { method: "POST" }),

  getMine: () => request("/payments/my"),

  // admin
  getAll: (status?: string) => request(`/payments${status ? `?status=${status}` : ""}`),

  refund: (id: string) => request(`/payments/${id}/refund`, { method: "POST" }),
};

// Contact
export const contactAPI = {
  submit: (data: { name: string; email: string; phone?: string; subject?: string; message: string }) =>
    request("/contact", { method: "POST", body: JSON.stringify(data) }),
};

// Notifications
export const notificationAPI = {
  getAll: () => request("/notifications/"),
  markAsRead: (id: string) => request(`/notifications/read/${id}`, { method: "PUT" }),
  markAllAsRead: () => request("/notifications/read-all", { method: "PUT" }),
  delete: (id: string) => request(`/notifications/${id}`, { method: "DELETE" }),
};

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const productionApiUrl = "https://api.carelinkplus.me/api";

const API_URL =
  process.env.NODE_ENV === "production"
    ? configuredApiUrl && !/localhost|127\.0\.0\.1/.test(configuredApiUrl)
      ? configuredApiUrl.replace(/\/$/, "")
      : productionApiUrl
    : configuredApiUrl || "http://localhost:5000/api";

/* ============================================================
   AUTH TOKEN
============================================================ */

const getToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("carelink_token");
};

/* ============================================================
   GENERIC REQUEST
============================================================ */

const request = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();

  const headers: Record<string, string> = {
    ...(options.body instanceof FormData
      ? {}
      : {
          "Content-Type": "application/json",
        }),

    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

/* ============================================================
   MULTIPART / FORMDATA REQUEST
============================================================ */

const requestFormData = async (
  endpoint: string,
  formData: FormData,
  method = "POST",
) =>
  request(endpoint, {
    method,
    body: formData,
  });

/* ============================================================
   AUTH API
============================================================ */

export const authAPI = {
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role: string;
  }) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMe: () => request("/auth/me"),

  /* NEW:
     Update name, email, phone and profile photo.
  */
  updateProfile: (formData: FormData) =>
    requestFormData("/auth/me", formData, "PUT"),

  forgotPassword: (email: string) =>
    request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({
        email,
      }),
    }),

    resetPassword: (token: string, password: string) =>
    request(`/auth/reset-password/${token}`, {
      method: "POST",
      body: JSON.stringify({
        password,
      }),
    }),

  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) =>
    request("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  verifyEmail: (token: string) => request(`/auth/verify-email/${token}`),
};

/* ============================================================
   PARENT API
============================================================ */

export const parentAPI = {
  getAll: () => request("/parent/"),

  getOne: (id: string) => request(`/parent/${id}`),

  create: (data: object) =>
    request("/parent/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: object) =>
    request(`/parent/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request(`/parent/${id}`, {
      method: "DELETE",
    }),
};

/* ============================================================
   CARETAKER API
============================================================ */

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

/* ============================================================
   BOOKING API
============================================================ */

export const bookingAPI = {
  hospitals: (coords?: { lat: number; lng: number }) => {
    const query = coords ? `?lat=${coords.lat}&lng=${coords.lng}` : "";

    return request(`/bookings/hospitals${query}`);
  },

  geocode: (q: string) =>
    request(`/bookings/geocode?q=${encodeURIComponent(q)}`),

  quote: (data: object) =>
    request("/bookings/quote", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  create: (data: object) =>
    request("/bookings", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  clientList: () => request("/bookings/client"),

  caretakerList: () => request("/bookings/caretaker"),

  get: (id: string) => request(`/bookings/${id}`),

  updateStatus: (id: string, status: string, reason?: string) =>
    request(`/bookings/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({
        status,
        reason,
      }),
    }),

  generateOtp: (id: string) =>
    request(`/bookings/${id}/otp/generate`, {
      method: "POST",
    }),

  verifyOtp: (id: string, code: string) =>
    request(`/bookings/${id}/otp/verify`, {
      method: "POST",
      body: JSON.stringify({
        code,
      }),
    }),

  updateProgress: (id: string, stage: string) =>
    request(`/bookings/${id}/progress`, {
      method: "PUT",
      body: JSON.stringify({
        stage,
      }),
    }),

  clientComplete: (id: string) =>
    request(`/bookings/${id}/client-complete`, {
      method: "PUT",
    }),
};

/* ============================================================
   PAYMENT API
============================================================ */

export const paymentAPI = {
  createCheckout: (paymentId: string) =>
    request("/payments/checkout", {
      method: "POST",
      body: JSON.stringify({
        paymentId,
      }),
    }),

  get: (id: string) => request(`/payments/${id}`),

  confirmSession: (sessionId: string) =>
    request(`/payments/session/${sessionId}`),

  connectOnboarding: () =>
    request("/payments/connect/onboarding", {
      method: "POST",
    }),

  connectBalance: () => request("/payments/connect/balance"),

  connectPayout: (amount: number) =>
    request("/payments/connect/payout", {
      method: "POST",
      body: JSON.stringify({
        amount,
      }),
    }),

  adminBalance: () => request("/payments/admin/balance"),

  adminSummary: () => request("/payments/admin/summary"),

  adminWithdrawals: () => request("/payments/admin/withdrawals"),

  adminPayout: (amount: number) =>
    request("/payments/admin/payout", {
      method: "POST",
      body: JSON.stringify({
        amount,
      }),
    }),
};

/* ============================================================
   FEEDBACK API
============================================================ */

export const feedbackAPI = {
  create: (data: {
    bookingId: string;
    rating: number;
    comment?: string;
    wouldRecommend?: boolean;
  }) =>
    request("/feedback", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  listAdmin: () => request("/feedback/admin"),
};

/* ============================================================
   CONTACT API
============================================================ */

export const contactAPI = {
  create: (data: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }) =>
    request("/contact", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  list: () => request("/contact"),

  updateStatus: (id: string, status: string) =>
    request(`/contact/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        status,
      }),
    }),

  markAsRead: (id: string) =>
    request(`/contact/${id}/read`, {
      method: "PUT",
    }),

  updatePriority: (id: string, priority: string) =>
    request(`/contact/${id}/priority`, {
      method: "PUT",
      body: JSON.stringify({ priority }),
    }),

  updateNote: (id: string, adminNote: string) =>
    request(`/contact/${id}/note`, {
      method: "PUT",
      body: JSON.stringify({ adminNote }),
    }),

  reply: (id: string, replyMessage: string, status?: string) =>
    request(`/contact/${id}/reply`, {
      method: "POST",
      body: JSON.stringify({
        replyMessage,
        ...(status ? { status } : {}),
      }),
    }),
};

/* ============================================================
   SETTINGS API
============================================================ */

export const settingsAPI = {
  getPublic: () => request("/settings/public"),

  get: () => request("/settings"),

  update: (data: object) =>
    request("/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

/* ============================================================
   ADMIN API
============================================================ */

export const adminAPI = {
  getDashboard: () => request("/admin/dashboard"),

  getUsers: (params?: { role?: string; search?: string }) => {
    const query = params
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
      : "";

    return request(`/admin/users${query}`);
  },

  getUserById: (id: string) => request(`/admin/users/${id}`),

  toggleUserStatus: (id: string) =>
    request(`/admin/users/${id}/toggle-status`, {
      method: "PUT",
    }),

  deleteUser: (id: string) =>
    request(`/admin/users/${id}`, {
      method: "DELETE",
    }),

  getApplications: (status?: string) =>
    request(`/admin/applications${status ? `?status=${status}` : ""}`),

  getApplicationById: (id: string) => request(`/admin/applications/${id}`),

  approveApplication: (id: string, note?: string) =>
    request(`/admin/applications/${id}/approve`, {
      method: "PUT",
      body: JSON.stringify({
        note,
      }),
    }),

  rejectApplication: (id: string, note?: string) =>
    request(`/admin/applications/${id}/reject`, {
      method: "PUT",
      body: JSON.stringify({
        note,
      }),
    }),

  getVerificationResults: () => request("/admin/verifications"),

  getVerificationById: (id: string) => request(`/admin/verifications/${id}`),

  getNotifications: () => request("/admin/notifications"),

  markNotificationRead: (id: string) =>
    request(`/admin/notifications/${id}/read`, {
      method: "PUT",
    }),

  getStatistics: () => request("/admin/statistics"),

  getBookings: () => request("/admin/bookings"),

  updateBooking: (
    id: string,
    data: {
      status?: string;
      scheduledDate?: string;
      startTime?: string;
      serviceNotes?: string;
      cancellationReason?: string;
    },
  ) =>
    request(`/admin/bookings/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteBooking: (id: string) =>
    request(`/admin/bookings/${id}`, {
      method: "DELETE",
    }),

  getPayments: () => request("/admin/payments"),
};

/* ============================================================
   NOTIFICATION API
============================================================ */

export const notificationAPI = {
  getAll: () => request("/notifications/"),

  markAsRead: (id: string) =>
    request(`/notifications/read/${id}`, {
      method: "PUT",
    }),

  markAllAsRead: () =>
    request("/notifications/read-all", {
      method: "PUT",
    }),

  delete: (id: string) =>
    request(`/notifications/${id}`, {
      method: "DELETE",
    }),
};

/* ============================================================
   RECOMMENDATION API
============================================================ */

export const recommendationAPI = {
  get: (coords?: { lat: number; lng: number }) => {
    const query = coords ? `?lat=${coords.lat}&lng=${coords.lng}` : "";

    return request(`/recommendations${query}`);
  },
};

/* ============================================================
   EMERGENCY API
============================================================ */

export const emergencyAPI = {
  trigger: (data: object) =>
    request("/emergency", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  mine: () => request("/emergency/mine"),

  adminList: () => request("/emergency/admin"),

  resolve: (id: string) =>
    request(`/emergency/${id}/resolve`, {
      method: "PUT",
    }),
};

/* ============================================================
   PUBLIC STATISTICS API
============================================================ */

export const publicAPI = {
  getStatistics: () => request("/public/statistics"),
};

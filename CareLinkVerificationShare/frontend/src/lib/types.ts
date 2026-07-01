// Users
export interface User {
  id: number;
  name: string;
  role: string;
  email: string;
  status: string;
  joined: string;
}

// Caretaker Applications
export interface CaretakerApp {
  id: string;
  name: string;
  contact: string;
  applied: string;
  status: string;
}

// Bookings
export interface Booking {
  id: string;
  client: string;
  caretaker: string;
  service: string;
  date: string;
  amount: string;
  status: string;
}

// Payments
export interface Payment {
  id: string;
  booking: string;
  client: string;
  amount: string;
  method: string;
  status: string;
  date: string;
}

// Feedback
export interface FeedbackItem {
  id: string;
  client: string;
  caretaker: string;
  rating: number;
  feedback: string;
  date: string;
  type: string;
  status: string;
}

// Notifications
export interface Notification {
  id: number;
  title: string;
  desc: string;
  time: string;
  type: string;
  read: boolean;
}

// Roles
export interface Role {
  name: string;
  description: string;
  users: number;
  status: string;
}

// Audit Logs
export interface AuditLog {
  user: string;
  action: string;
  details: string;
  ip: string;
  time: string;
}

// Emergency
export interface Emergency {
  id: string;
  type: string;
  reporter: string;
  location: string;
  time: string;
  status: string;
  caretaker: string;
}

// Toast
export interface ToastState {
  type: "success" | "error";
  msg: string;
}

// Summary Strip
export interface SummaryItem {
  label: string;
  value: string | number;
  sub?: string;
  colorClass?: string;
  subColor?: string;
}
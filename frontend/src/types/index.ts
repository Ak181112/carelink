export interface User {
  id: string;
  name: string;
  email: string;
  role: "family_member" | "caretaker" | "admin";
  phone?: string;
  isEmailVerified?: boolean;
}

export interface ParentProfile {
  _id: string;
  userId: string;
  fullName: string;
  age?: number;
  gender?: string;
  address: string;
  district?: string;
  town?: string;
  contactNumber: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  medicalConditions?: string;
  specialRequirements?: string;
  createdAt: string;
}

export interface CaretakerProfile {
  _id: string;
  userId: string | { name: string; email: string };
  fullName: string;
  contactNumber: string;
  nicNumber: string;
  address: string;
  district: string;
  town: string;
  experience: string;
  qualifications?: string;
  skills: string[];
  photo?: string;
  applicationStatus: "not_applied" | "pending" | "approved" | "rejected";
  averageRating: number;
  reviews: Review[];
  isAvailable: boolean;
}

export interface Review {
  _id: string;
  clientName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CaretakerApplication {
  _id: string;
  caretakerId: string | User;
  profileId?: string | CaretakerProfile;
  status: "pending" | "approved" | "rejected";
  documents: {
    nicDocument?: string;
    drivingLicense?: string;
    certificates?: string[];
    photo?: string;
  };
  adminNote?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
}

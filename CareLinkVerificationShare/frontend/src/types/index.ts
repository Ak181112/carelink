export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: "family_member" | "caretaker" | "admin";
  phone?: string;
  profilePhoto?: string | null;
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
  userId:
    | string
    | {
        _id?: string;
        name: string;
        email: string;
      };
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
  applicationStatus:
    | "not_applied"
    | "pending"
    | "approved"
    | "rejected";
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
  caretakerId:
    | string
    | User
    | {
        _id?: string;
        id?: string;
        name: string;
        email: string;
      };
  profileId?:
    | string
    | CaretakerProfile
    | {
        _id?: string;
        fullName?: string;
        address?: string;
        district?: string;
        town?: string;
        experience?: string;
      };
  status:
    | "pending"
    | "approved"
    | "rejected";
  verificationStatus?:
    | "pending"
    | "approved"
    | "rejected";
  documents: {
    nicDocument?: string;
    drivingLicense?: string;
    certificates?: string[];
    photo?: string;
  };
  nicNumber?: string;
  nicAddress?: string;
  profileAddress?: string;
  addressMatched?: boolean;
  ocrText?: string;
  adminNote?: string;
  submittedAt: string;
  reviewedAt?: string;
  createdAt?: string;
  updatedAt?: string;
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
export interface User {
  id: string;
  _id?: string;
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
  userId: string | { _id?: string; name: string; email: string };
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
  clientId?: string;
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

  status: "pending" | "approved" | "rejected";
  verificationStatus?: "pending" | "verified" | "manual_review";
  ocrStatus?: "pending" | "success" | "failed";

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
  addressMatchPercentage?: number;
  ocrText?: string;

  adminNote?: string;
  manualOverride?: boolean;
  overrideReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminApplication extends CaretakerApplication {
  caretakerId: { _id?: string; name: string; email: string; phone?: string };
  profileId?: {
    _id?: string;
    fullName?: string;
    address?: string;
    district?: string;
    town?: string;
    experience?: string;
  };
}

export type BookingStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "in_progress"
  | "completed";

export interface BookingLocation {
  address: string;
  latitude?: number;
  longitude?: number;
}

export interface HospitalLocation extends BookingLocation {
  hospitalName: string;
}

/** A person reference is populated on list/detail responses, a bare id elsewhere. */
type Ref<T> = string | T;

export interface Booking {
  _id: string;

  parentId: Ref<{ _id: string; name: string; email: string; phone?: string }>;
  caretakerId: Ref<{ _id: string; name: string; email: string; phone?: string }>;
  parentProfileId: Ref<{
    _id: string;
    fullName: string;
    age?: number;
    gender?: string;
    contactNumber?: string;
    medicalConditions?: string;
  }>;

  bookingDate: string;
  bookingTime: string;
  estimatedHours: number;

  pickupLocation: BookingLocation;
  hospitalLocation: HospitalLocation;

  roadDistanceKm: number;
  ratePerKm: number;
  caretakerCharge: number;
  adminServiceFee: number;
  totalCost: number;

  status: BookingStatus;
  rejectedReason?: string;
  cancelledReason?: string;

  /** Only ever present on the client's own copy of the booking. */
  pickupOtp?: string;
  otpVerified: boolean;

  startedAt?: string;
  completedAt?: string;
  durationMinutes: number;

  paymentMethod: "cash" | "card";
  paymentStatus: "pending" | "paid" | "refunded";

  feedbackSubmitted: boolean;
  emergencyTriggered: boolean;
  emergencyMessage?: string;

  notes?: string;
  statusHistory?: { status: string; changedAt: string; note?: string }[];

  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingInput {
  caretakerId: string;
  parentProfileId: string;
  bookingDate: string;
  bookingTime: string;
  estimatedHours: number;
  pickupLocation: BookingLocation;
  hospitalLocation: HospitalLocation;
  paymentMethod?: "cash" | "card";
  notes?: string;
}

export interface Payment {
  _id: string;

  bookingId: Ref<{
    _id: string;
    hospitalLocation: HospitalLocation;
    bookingDate: string;
    bookingTime: string;
    totalCost: number;
    status: BookingStatus;
    caretakerId?: Ref<{ _id: string; name: string }>;
  }>;

  payerId: Ref<{ _id: string; name: string; email: string }>;

  /** The reference PayHere echoes back, e.g. CL-A1B2C3D4-9F2E11. */
  orderId: string;

  amount: number;
  currency: string;

  provider: "payhere" | "cash";
  status: "pending" | "paid" | "failed" | "cancelled" | "refunded" | "chargedback";

  payherePaymentId?: string | null;
  payhereStatusCode?: string | null;
  /** Card network or wallet, e.g. VISA / MASTER / EZCASH. */
  paymentMethod?: string | null;
  cardHolderName?: string | null;
  cardMaskedNumber?: string | null;
  statusMessage?: string;

  paidAt?: string | null;
  refundedAt?: string | null;

  createdAt: string;
  updatedAt: string;
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

/** One client review, flattened out of a caretaker profile for the admin feed. */
export interface AdminReview {
  _id: string;
  caretakerId: string;
  caretakerName: string;
  caretakerTown?: string;
  caretakerAverage: number;
  clientName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface ReviewStats {
  total: number;
  average: number;
  distribution: Record<string, number>;
  reviewedCaretakers: number;
}

export interface PlatformSettings {
  hourlyRate: number;
  adminServiceFee: number;
  ratePerKm: number;
  maxBookingHours: number;
  minNoticeHours: number;
  registrationOpen: boolean;
  autoApproveMatchedApplications: boolean;
  updatedAt?: string;
}

export interface ReportMonth {
  month: string;
  bookings: number;
  completed: number;
  cancelled: number;
  revenue: number;
  payments: number;
  newCaretakers: number;
  newClients: number;
}

export interface ReportData {
  range: { months: number; since: string };
  timeline: ReportMonth[];
  bookingsByStatus: Record<string, number>;
  applications: {
    total: number;
    addressMatched: number;
    manualOverride: number;
    approved: number;
    rejected: number;
    pending: number;
    ocrFailed: number;
  };
  topCaretakers: {
    name: string;
    town?: string;
    completedVisits: number;
    earned: number;
    averageRating: number;
  }[];
  popularHospitals: { hospital: string; bookings: number }[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
}
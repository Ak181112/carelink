import { Booking, BookingStatus } from "@/types";

export interface HospitalOption {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

/**
 * Hospitals covered by the Kurunegala pilot, with coordinates so the booking
 * form can price the travel charge without calling a geocoding service.
 */
export const KURUNEGALA_HOSPITALS: HospitalOption[] = [
  {
    name: "Teaching Hospital Kurunegala",
    address: "North Western Province, Kurunegala",
    latitude: 7.4863,
    longitude: 80.3623,
  },
  {
    name: "District General Hospital Kuliyapitiya",
    address: "Hettipola Road, Kuliyapitiya",
    latitude: 7.4708,
    longitude: 80.0406,
  },
  {
    name: "Base Hospital Nikaweratiya",
    address: "Puttalam Road, Nikaweratiya",
    latitude: 7.7461,
    longitude: 80.1139,
  },
  {
    name: "Base Hospital Wariyapola",
    address: "Wariyapola, Kurunegala District",
    latitude: 7.6247,
    longitude: 80.2361,
  },
  {
    name: "Base Hospital Panduwasnuwara",
    address: "Panduwasnuwara, Kurunegala District",
    latitude: 7.5372,
    longitude: 80.1011,
  },
  {
    name: "District Hospital Maho",
    address: "Maho, Kurunegala District",
    latitude: 7.8225,
    longitude: 80.2758,
  },
  {
    name: "District Hospital Polgahawela",
    address: "Polgahawela, Kurunegala District",
    latitude: 7.3306,
    longitude: 80.3006,
  },
  {
    name: "Asiri Hospital Kurunegala",
    address: "Colombo Road, Kurunegala",
    latitude: 7.4795,
    longitude: 80.3589,
  },
  {
    name: "Nawaloka Medical Centre Kurunegala",
    address: "Negombo Road, Kurunegala",
    latitude: 7.4818,
    longitude: 80.3542,
  },
];

export const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Awaiting caretaker",
  accepted: "Accepted",
  rejected: "Declined",
  cancelled: "Cancelled",
  in_progress: "Visit in progress",
  completed: "Completed",
};

export const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-600",
  cancelled: "bg-gray-200 text-gray-600",
  in_progress: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
};

export const formatLkr = (amount: number) =>
  `LKR ${amount.toLocaleString("en-LK")}`;

export const formatBookingDate = (date: string) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/** Unwraps a field that the API populates on some responses and not on others. */
export const nameOf = (
  ref: Booking["parentId"] | Booking["caretakerId"],
  fallback = "—",
) => (typeof ref === "object" && ref ? ref.name : fallback);

export const parentNameOf = (ref: Booking["parentProfileId"], fallback = "—") =>
  typeof ref === "object" && ref ? ref.fullName : fallback;

/** The soonest a booking can be made, as a `yyyy-mm-dd` string for <input type="date">. */
export const todayIso = () => {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
};

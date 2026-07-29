/**
 * Booking pricing for the Kurunegala pilot, in LKR.
 *
 * The default rates reproduce the figures already stored on existing bookings:
 * 2 estimated hours -> caretakerCharge 1500, adminServiceFee 500, ratePerKm 120.
 * An admin can override them in Settings, which is why `quoteBooking` takes the
 * rates as an argument instead of reading module constants.
 */
const HOURLY_RATE = 750;
const ADMIN_SERVICE_FEE = 500;
const RATE_PER_KM = 120;

const DEFAULT_RATES = {
  hourlyRate: HOURLY_RATE,
  adminServiceFee: ADMIN_SERVICE_FEE,
  ratePerKm: RATE_PER_KM,
};

const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees) => (degrees * Math.PI) / 180;

/**
 * Straight-line distance between two points. Real road distance is longer, so
 * the result is padded by a routing factor to keep quotes from under-charging.
 */
const ROAD_WINDING_FACTOR = 1.3;

const estimateRoadDistanceKm = (from, to) => {
  const lat1 = from?.latitude;
  const lon1 = from?.longitude;
  const lat2 = to?.latitude;
  const lon2 = to?.longitude;

  const missing = [lat1, lon1, lat2, lon2].some(
    (value) => typeof value !== "number" || Number.isNaN(value)
  );

  if (missing) return 0;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;

  const straightLineKm = 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));

  return Math.round(straightLineKm * ROAD_WINDING_FACTOR * 10) / 10;
};

/**
 * Quotes a booking. Always called server-side: the client sends the trip
 * details, never the price. `rates` comes from Settings so an admin can change
 * pricing without a redeploy; omitting it falls back to the pilot defaults.
 */
const quoteBooking = ({
  estimatedHours,
  pickupLocation,
  hospitalLocation,
  rates = DEFAULT_RATES,
}) => {
  const hourlyRate = rates.hourlyRate ?? HOURLY_RATE;
  const serviceFee = rates.adminServiceFee ?? ADMIN_SERVICE_FEE;
  const ratePerKm = rates.ratePerKm ?? RATE_PER_KM;

  const roadDistanceKm = estimateRoadDistanceKm(pickupLocation, hospitalLocation);

  const caretakerCharge = hourlyRate * estimatedHours;
  const travelCharge = Math.round(roadDistanceKm * ratePerKm);

  return {
    roadDistanceKm,
    ratePerKm,
    caretakerCharge,
    adminServiceFee: serviceFee,
    totalCost: caretakerCharge + serviceFee + travelCharge,
  };
};

module.exports = {
  HOURLY_RATE,
  ADMIN_SERVICE_FEE,
  RATE_PER_KM,
  DEFAULT_RATES,
  estimateRoadDistanceKm,
  quoteBooking,
};

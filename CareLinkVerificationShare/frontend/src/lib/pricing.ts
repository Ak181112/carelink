/**
 * Display-only copies of the rates in `backend/utils/pricing.js`.
 *
 * These drive the quote the client sees before submitting. The booking is
 * always priced again on the server, so a stale value here can never change
 * what somebody is actually charged — keep them in sync anyway.
 */
export const HOURLY_RATE = 750;
export const ADMIN_SERVICE_FEE = 500;
export const RATE_PER_KM = 120;

/** Mirrors quoteBooking() for the parts the booking form can compute. */
export const estimateBookingTotal = (estimatedHours: number, roadDistanceKm = 0) =>
  HOURLY_RATE * estimatedHours +
  ADMIN_SERVICE_FEE +
  Math.round(roadDistanceKm * RATE_PER_KM);

const EARTH_RADIUS_KM = 6371;
const ROAD_WINDING_FACTOR = 1.3;

interface Point {
  latitude?: number;
  longitude?: number;
}

/**
 * Same estimate as `estimateRoadDistanceKm` in backend/utils/pricing.js:
 * great-circle distance padded for the fact that roads are not straight.
 * Returns 0 when either point has no coordinates.
 */
export const estimateRoadDistanceKm = (from?: Point, to?: Point): number => {
  const values = [from?.latitude, from?.longitude, to?.latitude, to?.longitude];

  if (values.some((v) => typeof v !== "number" || Number.isNaN(v))) return 0;

  const [lat1, lon1, lat2, lon2] = values as number[];
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const straightLineKm = 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));

  return Math.round(straightLineKm * ROAD_WINDING_FACTOR * 10) / 10;
};

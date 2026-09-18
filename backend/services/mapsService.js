const DEFAULT_RADIUS_M = 25000;
const USER_AGENT = process.env.OSM_USER_AGENT || "CareLinkPlus/1.0 (university project; contact@example.com)";

// Resilient hospital registry for the Kurunegala pilot district.
// These records are fallback candidates when external place providers
// are unavailable or have incomplete coverage. External providers are
// still preferred and their results are merged with this registry.
const CURATED_HOSPITALS = [
  // Kurunegala
  { name: "Teaching Hospital Kurunegala", address: "Kurunegala, North Western Province, Sri Lanka", district: "Kurunegala", town: "Kurunegala", location: { lat: 7.479096, lng: 80.35914, placeId: null } },
  { name: "Kurunegala Hospital", address: "Kurunegala, North Western Province, Sri Lanka", district: "Kurunegala", town: "Kurunegala", location: { lat: 7.478422, lng: 80.359839, placeId: null } },

  // Kuliyapitiya
  { name: "Teaching Hospital Kuliyapitiya", address: "Kuliyapitiya, Kurunegala District, North Western Province, Sri Lanka", district: "Kurunegala", town: "Kuliyapitiya", location: { lat: 7.47131, lng: 80.04481, placeId: null } },
  { name: "District Base Hospital Kuliyapitiya", address: "Hettipola Road, Kuliyapitiya, Sri Lanka", district: "Kurunegala", town: "Kuliyapitiya", location: { lat: 7.4720452, lng: 80.0446054, placeId: null } },
  { name: "Siyasi Private Hospital", address: "132/3 Hettipola Rd, Kuliyapitiya 60200, Sri Lanka", district: "Kurunegala", town: "Kuliyapitiya", location: { lat: 7.472124, lng: 80.044312, placeId: null } },
  { name: "Gunerathne Hospital", address: "Fathima Road, Kuliyapitiya, Sri Lanka", district: "Kurunegala", town: "Kuliyapitiya", location: { lat: 7.47713, lng: 80.0451462, placeId: null } },
  { name: "Medical Centre Kuliyapitiya", address: "Kurunegala-Narammala-Madampe Road, Kuliyapitiya, Sri Lanka", district: "Kurunegala", town: "Kuliyapitiya", location: { lat: 7.466969, lng: 80.06102, placeId: null } },

  // Pannala / nearby Pannala DS
  { name: "Pannala Medical Center", address: "Pannala, Kurunegala District, Sri Lanka", district: "Kurunegala", town: "Pannala", location: { lat: 7.327847, lng: 80.0249934, placeId: null } },
  { name: "Mankandura Hospital", address: "Makandura Pahala, Pannala Divisional Secretariat, Kurunegala District, Sri Lanka", district: "Kurunegala", town: "Pannala", location: { lat: 7.32045, lng: 79.97417, placeId: null } },
  { name: "Base Hospital Dambadeniya", address: "Negombo Road, Dambadeniya, Kurunegala District, Sri Lanka", district: "Kurunegala", town: "Dambadeniya", location: { lat: 7.3486348, lng: 80.1373146, placeId: null } },

  // Nikaweratiya
  { name: "Nikaweratiya Base Hospital", address: "Nikaweratiya-Heelogama Road, Nikaweratiya, Sri Lanka", district: "Kurunegala", town: "Nikaweratiya", location: { lat: 7.7474755, lng: 80.1144457, placeId: null } },

  // Maho
  { name: "Mahawa Base Hospital", address: "Maho, Kurunegala District, North Western Province, Sri Lanka", district: "Kurunegala", town: "Maho", location: { lat: 7.82353, lng: 80.28247, placeId: null } },

  // Ibbagamuwa / Gokarella
  { name: "Gokarella Divisional Hospital", address: "Gokarella, Ibbagamuwa Divisional Secretariat, Kurunegala District, Sri Lanka", district: "Kurunegala", town: "Ibbagamuwa", location: { lat: 7.58537, lng: 80.47552, placeId: null } },
  { name: "Wayamba Medical Center", address: "Ibbagamuwa, Kurunegala District, Sri Lanka", district: "Kurunegala", town: "Ibbagamuwa", location: { lat: 7.54604, lng: 80.44883, placeId: null } },
  { name: "Weerawardhana Medical Center", address: "Ibbagamuwa, Kurunegala District, Sri Lanka", district: "Kurunegala", town: "Ibbagamuwa", location: { lat: 7.5465, lng: 80.45029, placeId: null } },

  // Wariyapola
  { name: "Wariyapola Divisional Hospital", address: "Kurunegala Road, Wariyapola 60400, Sri Lanka", district: "Kurunegala", town: "Wariyapola", location: { lat: 7.61653, lng: 80.25026, placeId: null } },
  { name: "Wariyapola District Hospital", address: "Katugastota-Kurunegala-Puttalam Highway, Wariyapola, Sri Lanka", district: "Kurunegala", town: "Wariyapola", location: { lat: 7.6162753, lng: 80.2497308, placeId: null } },

  // Narammala / Dambadeniya
  { name: "Narammala District Hospital", address: "New Hospital Road, Narammala, Kurunegala, Sri Lanka", district: "Kurunegala", town: "Narammala", location: { lat: 7.4311484, lng: 80.2065098, placeId: null } },
  { name: "Ayurweda Hospital Narammala", address: "Narammala, Kurunegala District, Sri Lanka", district: "Kurunegala", town: "Narammala", location: { lat: 7.43257, lng: 80.21259, placeId: null } },
  { name: "Dambadeniya Hospital", address: "Dambadeniya, Narammala Divisional Secretariat, Kurunegala District, Sri Lanka", district: "Kurunegala", town: "Dambadeniya", location: { lat: 7.34877, lng: 80.13767, placeId: null } },

  // Polgahawela
  { name: "Polgahawela Base Hospital", address: "Kulipitiya Road, Polgahawela, Sri Lanka", district: "Kurunegala", town: "Polgahawela", location: { lat: 7.3371, lng: 80.30384, placeId: null } },
  { name: "Polgahawela District Hospital", address: "A6, Polgahawela, Kurunegala, Sri Lanka", district: "Kurunegala", town: "Polgahawela", location: { lat: 7.3375225, lng: 80.3038225, placeId: null } },

  // Alawwa
  { name: "Alawwa District Hospital", address: "Paramaulla, Alawwa, Kurunegala District, Sri Lanka", district: "Kurunegala", town: "Alawwa", location: { lat: 7.29812, lng: 80.23017, placeId: null } },
  { name: "Thalwaththa Hospital", address: "Nawathalwatta, Alawwa Division, Kurunegala District, Sri Lanka", district: "Kurunegala", town: "Alawwa", location: { lat: 7.29182, lng: 80.18576, placeId: null } },

  // Polpithigama
  { name: "Polpithigama Divisional Hospital", address: "Polpithigama, Kurunegala District, North Western Province, Sri Lanka", district: "Kurunegala", town: "Polpithigama", location: { lat: 7.81525, lng: 80.40526, placeId: null } },

  // Ganewatta / Hiripitiya
  { name: "Hiripitiya Divisional Hospital", address: "Wariyapola-Ganewatta-Kumbukgete Road, Hiripitiya, Kurunegala District, Sri Lanka", district: "Kurunegala", town: "Ganewatta", location: { lat: 7.65515, lng: 80.36826, placeId: null } },
  { name: "Hiripitiya Hospital", address: "Ganewatta Road, Hiripitiya, Kurunegala District, Sri Lanka", district: "Kurunegala", town: "Ganewatta", location: { lat: 7.6556601, lng: 80.3675008, placeId: null } },

  // Bingiriya
  { name: "District Hospital Bingiriya", address: "Chilaw-Wariyapola Road, Bingiriya, Sri Lanka", district: "Kurunegala", town: "Bingiriya", location: { lat: 7.5984, lng: 79.93189, placeId: null } },
  { name: "Bingiriya Public Hospital", address: "Wariyapola Road, Bingiriya, Sri Lanka", district: "Kurunegala", town: "Bingiriya", location: { lat: 7.598636, lng: 79.9319831, placeId: null } },
  { name: "Weerapokuna Hospital", address: "Pahala Kiniyama, Bingiriya Divisional Secretariat, Kurunegala District, Sri Lanka", district: "Kurunegala", town: "Bingiriya", location: { lat: 7.65191, lng: 79.98924, placeId: null } },
];

const haversineKm = (a, b) => {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

const normalizeSriLankanQuery = (input) => {
  const raw = String(input || "").trim();
  if (!raw) return [];
  const variants = [];
  const add = (value) => {
    const q = String(value || "")
      .replace(/\s+/g, " ")
      .replace(/\s*,\s*/g, ", ")
      .replace(/\s*\/\s*/g, ", ")
      .trim();
    if (q && !variants.includes(q)) variants.push(q);
  };

  // Keep the full address first for providers that can resolve house numbers.
  add(raw);

  const noHouseNumber = raw.replace(/^\s*No\.?\s*\d+[A-Za-z\/-]*\s*,?\s*/i, "");
  add(noHouseNumber);

  // A street + town query is more reliable than a long Sri Lankan address
  // when the free geocoder incorrectly snaps a house number to an unrelated POI.
  const parts = noHouseNumber.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const streetTown = parts.slice(0, 2).join(", ");
    add(streetTown);
  }

  add(noHouseNumber.replace(/\bNorth Western Province\b\s*,?/i, ""));
  add(noHouseNumber.replace(/\bSri Lanka\b/gi, "").replace(/\s*,\s*$/, ""));
  return variants.slice(0, 8);
};

const getAddressHintTokens = (input) => {
  const stop = new Set([
    "no", "road", "street", "lane", "avenue", "rd", "st", "ln",
    "north", "western", "province", "sri", "lanka", "the", "of", "hospital", "clinic", "medical", "center"
  ]);
  return String(input || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !stop.has(token));
};

const scoreGeocodeCandidate = (candidate, input) => {
  const text = [
    candidate?.display_name || "",
    candidate?.type || "",
    candidate?.class || "",
    JSON.stringify(candidate?.address || {}),
  ].join(" ").toLowerCase();
  const tokens = getAddressHintTokens(input);
  let score = tokens.reduce((total, token) => total + (text.includes(token) ? 1 : 0), 0);

  const roadMatch = String(input || "").match(/([^,]+\b(?:road|rd|street|st|lane|ln|avenue|ave))\b/i);
  if (roadMatch && text.includes(roadMatch[1].trim().toLowerCase())) score += 6;

  const localityMatch = String(input || "").match(/(?:road|rd|street|st|lane|ln|avenue|ave)\s*,\s*([^,]+)/i);
  if (localityMatch && text.includes(localityMatch[1].trim().toLowerCase())) score += 4;

  return score;
};

const withSriLanka = (q) => {
  const value = String(q || "").trim();
  return /\bsri\s*lanka\b/i.test(value) ? value : `${value}, Sri Lanka`;
};

const fetchJson = async (url, options = {}, timeoutMs = 12000) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const text = await response.text();
    let data = {};
    try { data = text ? JSON.parse(text) : {}; } catch (_) {}
    return { response, data };
  } finally {
    clearTimeout(timeout);
  }
};

async function computeGoogleRoadDistance(origin, destination) {
  const apiKey = process.env.GOOGLE_ROUTES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return { ok: false, status: 0, code: "MISSING_API_KEY", message: "Google Routes API key is not configured." };
  }

  const normalizedOrigin = { lat: Number(origin?.lat), lng: Number(origin?.lng) };
  const normalizedDestination = { lat: Number(destination?.lat), lng: Number(destination?.lng) };
  if (![normalizedOrigin.lat, normalizedOrigin.lng, normalizedDestination.lat, normalizedDestination.lng].every(Number.isFinite)) {
    return { ok: false, status: 400, code: "INVALID_COORDINATES", message: "Origin and destination coordinates must be valid numbers." };
  }

  const body = {
    origin: { location: { latLng: { latitude: normalizedOrigin.lat, longitude: normalizedOrigin.lng } } },
    destination: { location: { latLng: { latitude: normalizedDestination.lat, longitude: normalizedDestination.lng } } },
    travelMode: "DRIVE",
    routingPreference: "TRAFFIC_UNAWARE",
    computeAlternativeRoutes: false,
    routeModifiers: { avoidTolls: false, avoidHighways: false, avoidFerries: false },
    languageCode: "en-US",
    units: "METRIC",
  };

  const maxAttempts = Math.max(1, Number(process.env.GOOGLE_ROUTES_MAX_RETRIES || 2));
  const timeoutMs = Math.max(5000, Number(process.env.GOOGLE_ROUTES_TIMEOUT_MS || 15000));
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const { response, data } = await fetchJson(
        "https://routes.googleapis.com/directions/v2:computeRoutes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "routes.distanceMeters,routes.duration",
          },
          body: JSON.stringify(body),
        },
        timeoutMs,
      );

      if (!response.ok) {
        const googleError = data?.error || {};
        lastError = {
          ok: false,
          status: response.status,
          code: googleError.status || `HTTP_${response.status}`,
          message: googleError.message || `Google Routes API returned HTTP ${response.status}.`,
          details: googleError.details || [],
        };
        if ((response.status >= 500 || response.status === 429) && attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 350 * attempt));
          continue;
        }
        break;
      }

      const route = data?.routes?.[0];
      if (!route || !Number.isFinite(Number(route.distanceMeters))) {
        lastError = { ok: false, status: 502, code: "NO_ROUTE", message: "Google Routes API returned no usable route." };
        break;
      }

      const durationSeconds = parseFloat(String(route.duration || "0").replace("s", ""));
      return {
        ok: true,
        status: 200,
        distanceKm: Number((Number(route.distanceMeters) / 1000).toFixed(2)),
        durationMinutes: Number.isFinite(durationSeconds) ? Math.round(durationSeconds / 60) : null,
        source: "google_routes",
      };
    } catch (error) {
      lastError = {
        ok: false,
        status: 0,
        code: error?.name === "AbortError" ? "TIMEOUT" : "NETWORK_ERROR",
        message: error?.message || "Unable to reach Google Routes API.",
      };
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 350 * attempt));
        continue;
      }
    }
  }

  return lastError || { ok: false, status: 502, code: "UNKNOWN_ROUTE_ERROR", message: "Google Routes API request failed." };
}

async function computeRoadDistance(origin, destination, options = {}) {
  const allowFallback = options.allowFallback !== false;
  const fallback = (googleError = null) => ({
    distanceKm: Number(haversineKm(origin, destination).toFixed(2)),
    durationMinutes: null,
    source: "haversine_fallback",
    googleError: googleError ? { status: googleError.status, code: googleError.code, message: googleError.message } : null,
  });

  const result = await computeGoogleRoadDistance(origin, destination);
  if (result.ok) return result;

  if (String(process.env.NODE_ENV || "development") !== "production") {
    console.warn(`[Google Routes] ${result.code}: ${result.message}${result.status ? ` (HTTP ${result.status})` : ""}`);
  }

  if (!allowFallback) {
    const error = new Error(result.message);
    error.statusCode = result.status || 502;
    error.code = result.code;
    error.provider = "google_routes";
    throw error;
  }

  return fallback(result);
}

async function checkGoogleRoutes(origin, destination) {
  const result = await computeGoogleRoadDistance(origin, destination);
  return {
    provider: "google_routes",
    ok: Boolean(result.ok),
    status: result.status,
    code: result.code || null,
    message: result.message || null,
    distanceKm: result.distanceKm ?? null,
    durationMinutes: result.durationMinutes ?? null,
  };
}

async function geocodeWithGoogle(address) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;

  for (const query of normalizeSriLankanQuery(address)) {
    try {
      const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
      url.searchParams.set("address", withSriLanka(query));
      url.searchParams.set("key", apiKey);
      url.searchParams.set("region", "lk");
      url.searchParams.set("language", "en");
      url.searchParams.set("components", "country:LK");

      const { response, data } = await fetchJson(url.toString(), {}, 8000);
      if (!response.ok) continue;
      if (data.status === "OK" && data.results?.length) {
        const first = data.results[0];
        return {
          formattedAddress: first.formatted_address,
          lat: Number(first.geometry.location.lat),
          lng: Number(first.geometry.location.lng),
          placeId: first.place_id || null,
          source: "google_geocoding",
        };
      }
    } catch (_) {}
  }
  return null;
}

async function geocodeWithGooglePlaces(address) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;

  const queries = normalizeSriLankanQuery(address).map(withSriLanka);
  for (const textQuery of queries) {
    try {
      const { response, data } = await fetchJson("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location",
        },
        body: JSON.stringify({ textQuery, languageCode: "en", regionCode: "LK", pageSize: 5 }),
      }, 8000);
      if (!response.ok) continue;
      const place = data?.places?.[0];
      if (place?.location) {
        return {
          formattedAddress: place.formattedAddress || place.displayName?.text || textQuery,
          lat: Number(place.location.latitude),
          lng: Number(place.location.longitude),
          placeId: place.id || null,
          source: "google_places_text_search",
        };
      }
    } catch (_) {}
  }
  return null;
}

async function geocodeWithNominatim(address) {
  const enabled = String(process.env.ENABLE_FREE_MAP_FALLBACK ?? "true").toLowerCase() !== "false";
  if (!enabled) return null;

  const queries = normalizeSriLankanQuery(address);
  const allCandidates = [];

  for (const query of queries) {
    try {
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("format", "jsonv2");
      url.searchParams.set("q", withSriLanka(query));
      url.searchParams.set("countrycodes", "lk");
      url.searchParams.set("limit", "5");
      url.searchParams.set("addressdetails", "1");

      const { response, data } = await fetchJson(url.toString(), {
        headers: { Accept: "application/json", "User-Agent": USER_AGENT },
      }, 10000);
      if (!response.ok || !Array.isArray(data) || !data.length) continue;

      for (const candidate of data) {
        const lat = Number(candidate.lat);
        const lng = Number(candidate.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
        allCandidates.push({ candidate, score: scoreGeocodeCandidate(candidate, address), query });
      }
    } catch (_) {}
  }

  if (!allCandidates.length) return null;

  // Prefer candidates that match the requested street/town tokens. This prevents
  // a house-number search from snapping to an unrelated hospital/POI in another town.
  allCandidates.sort((a, b) => {
    const scoreDiff = b.score - a.score;
    if (scoreDiff !== 0) return scoreDiff;
    const aRoad = /road|street|lane|avenue|rd\b|st\b|ln\b/i.test(a.candidate?.type || "") ? 1 : 0;
    const bRoad = /road|street|lane|avenue|rd\b|st\b|ln\b/i.test(b.candidate?.type || "") ? 1 : 0;
    return bRoad - aRoad;
  });

  const best = allCandidates[0].candidate;
  return {
    formattedAddress: best.display_name,
    lat: Number(best.lat),
    lng: Number(best.lon),
    placeId: null,
    source: "openstreetmap_fallback",
    approximate: true,
  };
}

async function geocodeAddress(address) {
  const raw = String(address || "").trim();
  if (!raw) throw new Error("Address is required");

  const google = await geocodeWithGoogle(raw);
  if (google) return google;

  const places = await geocodeWithGooglePlaces(raw);
  if (places) return places;

  const osm = await geocodeWithNominatim(raw);
  if (osm) return osm;

  throw new Error("Address could not be located. Try entering the street, town, and district.");
}

async function nearbyHospitalsWithGoogle(origin) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return [];

  try {
    const { response, data } = await fetchJson("https://places.googleapis.com/v1/places:searchNearby", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.primaryType",
      },
      body: JSON.stringify({
        includedTypes: ["hospital"],
        maxResultCount: 10,
        rankPreference: "DISTANCE",
        locationRestriction: {
          circle: {
            center: { latitude: Number(origin.lat), longitude: Number(origin.lng) },
            radius: DEFAULT_RADIUS_M,
          },
        },
        languageCode: "en",
        regionCode: "LK",
      }),
    }, 10000);

    if (!response.ok || !Array.isArray(data?.places)) return [];
    return data.places
      .filter((p) => p?.location?.latitude != null && p?.location?.longitude != null)
      .map((p) => ({
        externalId: p.id || null,
        name: p.displayName?.text || "Hospital",
        address: p.formattedAddress || "Sri Lanka",
        district: "",
        town: "",
        location: { lat: Number(p.location.latitude), lng: Number(p.location.longitude), placeId: p.id || null },
        source: "google_places_nearby",
      }));
  } catch (_) {
    return [];
  }
}

async function nearbyHospitalsWithOverpass(origin) {
  const enabled = String(process.env.ENABLE_FREE_MAP_FALLBACK ?? "true").toLowerCase() !== "false";
  if (!enabled) return [];

  const radius = Math.min(Math.max(Number(process.env.HOSPITAL_SEARCH_RADIUS_M || DEFAULT_RADIUS_M), 1000), 25000);
  const query = `[out:json][timeout:15];(nwr[amenity=hospital](around:${radius},${Number(origin.lat)},${Number(origin.lng)});nwr[healthcare=hospital](around:${radius},${Number(origin.lat)},${Number(origin.lng)}););out center tags;`;

  try {
    const { response, data } = await fetchJson("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": USER_AGENT },
      body: new URLSearchParams({ data: query }).toString(),
    }, 18000);
    if (!response.ok || !Array.isArray(data?.elements)) return [];

    const seen = new Set();
    const results = [];
    for (const element of data.elements) {
      const lat = Number(element.lat ?? element.center?.lat);
      const lng = Number(element.lon ?? element.center?.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
      const tags = element.tags || {};
      const name = tags.name || tags["name:en"] || tags["official_name"] || "Hospital";
      const address = [tags["addr:housenumber"], tags["addr:street"], tags["addr:city"], tags["addr:district"], tags["addr:state"], tags["addr:country"]].filter(Boolean).join(", ") || "Sri Lanka";
      const key = `${name.toLowerCase()}|${lat.toFixed(5)}|${lng.toFixed(5)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      results.push({
        externalId: `osm:${element.type}:${element.id}`,
        name,
        address,
        district: tags["addr:district"] || "",
        town: tags["addr:city"] || tags["addr:town"] || tags["addr:suburb"] || "",
        location: { lat, lng, placeId: null },
        source: "openstreetmap_overpass",
      });
    }
    return results.slice(0, 15);
  } catch (_) {
    return [];
  }
}

const dedupeHospitals = (hospitals) => {
  const map = new Map();
  for (const hospital of hospitals) {
    const key = hospital.externalId
      || hospital.location?.placeId
      || `${String(hospital.name || "hospital").toLowerCase().trim()}|${Number(hospital.location?.lat).toFixed(5)}|${Number(hospital.location?.lng).toFixed(5)}`;
    if (!map.has(key)) map.set(key, hospital);
  }
  return Array.from(map.values());
};

const curatedHospitalsNear = (origin) => CURATED_HOSPITALS
  .map((hospital) => ({
    ...hospital,
    externalId: `curated:${hospital.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    source: "curated_registry",
  }))
  .filter((hospital) => haversineKm(origin, hospital.location) <= DEFAULT_RADIUS_M);

async function findNearbyHospitals(origin) {
  // Always merge all providers. Google may be enabled but return errors, while
  // OSM may have incomplete coverage. The curated district registry guarantees
  // that the main Kurunegala pilot towns still have known hospital candidates.
  const [google, osm] = await Promise.all([
    nearbyHospitalsWithGoogle(origin),
    nearbyHospitalsWithOverpass(origin),
  ]);

  const merged = dedupeHospitals([
    ...google,
    ...osm,
    ...curatedHospitalsNear(origin),
  ]);

  // Haversine is used only to reduce the candidate set. The controller then
  // calculates Google Routes road distance for the candidates before sorting
  // the final results shown to the user.
  return merged
    .sort((a, b) => haversineKm(origin, a.location) - haversineKm(origin, b.location))
    .slice(0, 20);
}

module.exports = {
  computeRoadDistance,
  checkGoogleRoutes,
  geocodeAddress,
  findNearbyHospitals,
  haversineKm,
};

"use client";

import { useState, useEffect, useCallback } from "react";
import SearchSection from "./SearchSection";
import CaretakerGrid from "./CaretakerGrid";
import { caretakerAPI } from "@/services/api";
import { CaretakerProfile } from "@/types";

export const KURUNEGALA_LOCATIONS = [
  "Giribawa",
  "Galgamuwa",
  "Ehetuwewa",
  "Maho",
  "Ambanpola",
  "Kotawehera",
  "Rasnayakepura",
  "Nikaweratiya",
  "Polpithigama",
  "Ibbagamuwa",
  "Ganewatta",
  "Ridigama",
  "Mawathagama",
  "Mallawapitiya",
  "Kurunegala",
  "Maspotha",
  "Weerabugedara",
  "Polgahawela",
  "Alawwa",
  "Narammala",
  "Kuliyapitiya East",
  "Kuliyapitiya West",
  "Wariyapola",
  "Panduwasnuwara East",
  "Bamunukotuwa",
  "Panduwasnuwara West",
  "Bingiriya",
  "Udubaddawa",
  "Kobeigane",
  "Pannala",
];

export default function FindCaretakersClient() {
  const [availability, setAvailability] = useState("");
  const [location, setLocation] = useState("");
  const [caretakers, setCaretakers] = useState<CaretakerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCaretakers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (location) params.town = location;

      const data = await caretakerAPI.getApproved(params);
      let results: CaretakerProfile[] = data.caretakers ?? data.data ?? [];

      if (availability === "today") {
        results = results.filter((c) => c.isAvailable);
      }

      setCaretakers(results);
    } catch {
      setCaretakers([]);
    } finally {
      setLoading(false);
    }
  }, [availability, location]);

  useEffect(() => {
    fetchCaretakers();
  }, [fetchCaretakers]);

  return (
    <>
      <SearchSection
        availability={availability}
        location={location}
        locations={KURUNEGALA_LOCATIONS}
        onAvailabilityChange={setAvailability}
        onLocationChange={setLocation}
        onSearch={fetchCaretakers}
      />
      <CaretakerGrid caretakers={caretakers} loading={loading} />
    </>
  );
}

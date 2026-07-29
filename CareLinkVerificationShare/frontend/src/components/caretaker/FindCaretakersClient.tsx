"use client";

import { useState, useCallback } from "react";
import SearchSection from "./SearchSection";
import CaretakerGrid from "./CaretakerGrid";
import { caretakerAPI } from "@/services/api";
import { useApiData } from "@/lib/useApiData";
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

  const fetchCaretakers = useCallback(async () => {
    const params: Record<string, string> = {};
    if (location) params.town = location;

    const data = await caretakerAPI.getApproved(params);
    const results: CaretakerProfile[] = data.caretakers ?? [];

    return availability === "today"
      ? results.filter((c) => c.isAvailable)
      : results;
  }, [availability, location]);

  const { data, loading, reload } = useApiData(fetchCaretakers);

  return (
    <>
      <SearchSection
        availability={availability}
        location={location}
        locations={KURUNEGALA_LOCATIONS}
        onAvailabilityChange={setAvailability}
        onLocationChange={setLocation}
        onSearch={reload}
      />
      <CaretakerGrid caretakers={data ?? []} loading={loading} />
    </>
  );
}

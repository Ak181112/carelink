"use client";

import { useEffect, useState } from "react";
import { settingsAPI } from "@/services/api";

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    ratePerKm: 120,
    caretakerServiceCharge: 1500,
    adminFeePercent: 15,
  });

  const [saved, setSaved] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    settingsAPI
      .get()
      .then((d) => setForm(d.settings))
      .catch((e) => setError(e.message));
  }, []);

  const save = async () => {
    setSaved("");
    setError("");

    try {
      const d = await settingsAPI.update(form);

      setForm(d.settings);
      setSaved("Settings saved successfully.");
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#091E42]">
          System Settings
        </h1>

        <p className="mt-1 text-[#42526E]">
          Configure pricing rules used by every new booking.
        </p>
      </div>

      <div className="space-y-5 rounded-2xl border bg-white p-6 shadow-sm">
        <div>
          <label className="font-semibold">
            Rate per km (LKR)
          </label>

          <input
            type="number"
            value={form.ratePerKm}
            onChange={(e) =>
              setForm({
                ...form,
                ratePerKm: Number(e.target.value),
              })
            }
            className="mt-2 w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div>
          <label className="font-semibold">
            Caretaker service charge (LKR)
          </label>

          <input
            type="number"
            value={form.caretakerServiceCharge}
            onChange={(e) =>
              setForm({
                ...form,
                caretakerServiceCharge: Number(e.target.value),
              })
            }
            className="mt-2 w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div>
          <label className="font-semibold">
            Admin service fee (%)
          </label>

          <input
            type="number"
            value={form.adminFeePercent}
            onChange={(e) =>
              setForm({
                ...form,
                adminFeePercent: Number(e.target.value),
              })
            }
            className="mt-2 w-full rounded-xl border px-4 py-3"
          />

          <p className="mt-2 text-xs text-slate-500">
            Updated requirement: default is 15%.
          </p>
        </div>

        <button
          type="button"
          onClick={save}
          className="rounded-xl bg-[#003898] px-5 py-3 font-semibold text-white"
        >
          Save settings
        </button>

        {saved && (
          <p className="text-sm text-emerald-700">
            {saved}
          </p>
        )}

        {error && (
          <p className="text-sm text-rose-700">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
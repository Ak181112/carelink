"use client";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function AccountTypeSelector({
  value,
  onChange,
}: Props) {
  return (
    <div className="grid grid-cols-2 gap-4">

      <button
        type="button"
        onClick={() => onChange("family")}
        className={`
          rounded-3xl
          p-5
          text-left
          border-2
          transition
          ${
            value === "family"
              ? "border-[#0052FF]"
              : "border-[#DFE1E6]"
          }
        `}
      >
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0052FF] text-white">
          ❤️
        </div>

        <h3 className="font-semibold text-[#091E42]">
          I&apos;m looking for care
        </h3>

        <p className="mt-1 text-sm text-[#6B7280]">
          Book caregivers for loved ones
        </p>
      </button>

      <button
        type="button"
        onClick={() => onChange("caretaker")}
        className={`
          rounded-3xl
          p-5
          text-left
          border-2
          transition
          ${
            value === "caretaker"
              ? "border-[#0052FF]"
              : "border-[#DFE1E6]"
          }
        `}
      >
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#DFE1E6]">
          👤
        </div>

        <h3 className="font-semibold text-[#091E42]">
          I provide care
        </h3>

        <p className="mt-1 text-sm text-[#6B7280]">
          Apply as a caregiver
        </p>
      </button>

    </div>
  );
}
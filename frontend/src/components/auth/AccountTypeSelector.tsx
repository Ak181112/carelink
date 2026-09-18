"use client";

import { HeartHandshake, UserRound } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function AccountTypeSelector({
  value,
  onChange,
}: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">

      {/* Family Member */}

      <button
        type="button"
        onClick={() => onChange("family_member")}
        className={`
           rounded-xl
  border
  p-3
  text-left
  transition-all
  duration-300
  ease-out
  hover:border-[#003898]
  hover:shadow-md
  
          ${
            value === "family_member"
              ? "border-[#003898] bg-[#F8FAFC]"
              : "border-slate-200 bg-white"
          }
        `}
      >
        <div
          className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${
            value === "family_member"
              ? "bg-[#003898] text-white"
              : "bg-slate-100 text-[#003898]"
          }`}
        >
          <HeartHandshake className="h-4.5 w-4.5" />
        </div>

        <h3 className="text-sm font-semibold text-[#0F172A]">
          I&apos;m looking for care
        </h3>

        <p className="mt-0.5 text-xs leading-4 text-[#64748B]">
          Book trusted care for your loved ones.
        </p>
      </button>

      {/* Caretaker */}

      <button
        type="button"
        onClick={() => onChange("caretaker")}
        className={`
          rounded-xl
  border
  p-3
  text-left
  transition-all
  duration-300
  ease-out
  hover:border-[#003898]
  hover:shadow-md
  
          ${
            value === "caretaker"
              ? "border-[#003898] bg-[#F8FAFC]"
              : "border-slate-200 bg-white"
          }
        `}
      >
        <div
          className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${
            value === "caretaker"
              ? "bg-[#003898] text-white"
              : "bg-slate-100 text-[#003898]"
          }`}
        >
          <UserRound className="h-4.5 w-4.5" />
        </div>

        <h3 className="text-sm font-semibold text-[#0F172A]">
          I provide care
        </h3>

        <p className="mt-0.5 text-xs leading-4 text-[#64748B]">
          Apply to become a verified caretaker.
        </p>
      </button>

    </div>
  );
}
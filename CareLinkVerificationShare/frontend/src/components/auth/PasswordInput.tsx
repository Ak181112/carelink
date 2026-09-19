"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface Props {
  placeholder: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PasswordInput({ placeholder, value, onChange }: Props) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
className="h-12 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 pr-12 text-sm outline-none transition focus:border-[#003898] focus:ring-2 focus:ring-[#003898]/10"      />
      <button
        type="button"
        onClick={() => setShow(!show)}
className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#003898] transition-colors duration-200"      >
        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
}

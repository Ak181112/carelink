"use client";

import { useState } from "react";

interface Props {
  placeholder: string;
}

export default function PasswordInput({
  placeholder,
}: Props) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">

      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        className="
          h-14
          w-full
          rounded-2xl
          border
          border-[#DFE1E6]
          px-5
          outline-none
          focus:border-[#0052FF]
        "
      />

      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-4 top-1/2 -translate-y-1/2"
      >
        👁️
      </button>

    </div>
  );
}
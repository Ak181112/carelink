"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface ThemeToggleProps {
  compact?: boolean;
}

export default function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`group inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-200 hover:border-[#003898] hover:bg-slate-50 hover:text-[#003898] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003898]/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-400 dark:hover:bg-slate-800 dark:hover:text-blue-300 ${
        compact ? "h-9 w-9" : "h-10 w-10"
      }`}
    >
      <span className="sr-only">
        {isDark ? "Switch to light mode" : "Switch to dark mode"}
      </span>
      {isDark ? (
        <Sun className="h-5 w-5 transition-transform duration-200 group-hover:rotate-12" />
      ) : (
        <Moon className="h-5 w-5 transition-transform duration-200 group-hover:-rotate-12" />
      )}
    </button>
  );
}

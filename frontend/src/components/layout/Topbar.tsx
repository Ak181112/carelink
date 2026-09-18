"use client";

import type { PageLabels } from "@/components/AdminDashboard";
import { Bell } from "lucide-react";
import ThemeToggle from "@/components/common/ThemeToggle";

interface TopbarProps {
  page: string;
  labels: PageLabels;
}

export default function Topbar({ page, labels }: TopbarProps) {
  const pageName = labels[page] ?? "Dashboard";

  return (
    <header
      className="
        fixed
        top-0
        left-72
        right-0
        z-40
        h-16
        border-b
        border-zinc-200/80
        bg-white
        shadow-sm
        transition-colors
        duration-200
        dark:border-slate-800
        dark:bg-slate-900
      "
    >
      <div className="flex h-full items-center justify-between px-8">

        {/* =====================================================
            LEFT SIDE
        ====================================================== */}
        <div>
          <h2
            className="
              text-xl
              font-bold
              tracking-tight
              text-zinc-900
              dark:text-slate-100
            "
          >
            {pageName}
          </h2>

          <p
            className="
              mt-0.5
              text-sm
              text-zinc-500
              dark:text-slate-400
            "
          >
            CareLink+ Administration
          </p>
        </div>

        {/* =====================================================
            RIGHT SIDE
        ====================================================== */}
        <div className="flex items-center gap-5">

          {/* =================================================
              DARK / LIGHT MODE
          ================================================== */}
          <ThemeToggle compact />

          {/* =================================================
              NOTIFICATIONS
          ================================================== */}
          <button
            type="button"
            aria-label="Notifications"
            className="
              relative
              rounded-xl
              p-2
              transition
              hover:bg-zinc-100
              dark:hover:bg-slate-800
            "
          >
            <Bell
              className="
                h-5
                w-5
                stroke-2
                text-zinc-700
                dark:text-slate-200
              "
            />

            {/* Notification count */}
            <span
              className="
                absolute
                -right-1
                -top-1
                flex
                h-5
                w-5
                items-center
                justify-center
                rounded-full
                bg-red-500
                text-[10px]
                font-bold
                text-white
              "
            >
              4
            </span>
          </button>

          {/* =================================================
              DIVIDER
          ================================================== */}
          <div
            className="
              h-8
              w-px
              bg-zinc-200
              dark:bg-slate-700
            "
          />

          {/* =================================================
              ADMIN PROFILE
          ================================================== */}
          <div className="flex items-center gap-3">

            {/* Avatar */}
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-[#003898]
                text-sm
                font-bold
                text-white
              "
            >
              A
            </div>

            {/* Profile information */}
            <div className="hidden md:block">

              <p
                className="
                  text-sm
                  font-semibold
                  text-zinc-900
                  dark:text-slate-100
                "
              >
                Administrator
              </p>

              <p
                className="
                  text-xs
                  text-zinc-500
                  dark:text-slate-400
                "
              >
                System Administrator
              </p>

            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();

  // Check whether the current route is active.
  const isActive = (path: string) => pathname === path;

  return (
    <header
      className="
        sticky top-0 z-50
        border-b border-slate-200
        bg-white
        transition-colors duration-200
        dark:border-slate-800
        dark:bg-slate-950
      "
    >
      <div
        className="
          mx-auto
          flex
          h-24
          max-w-7xl
          items-center
          justify-between
          px-4
          sm:px-6
          lg:px-6
        "
      >
        {/* =========================================================
            LOGO
            Existing Logo component is preserved.
        ========================================================== */}
        <Logo />

        {/* =========================================================
            DESKTOP NAVIGATION
            Existing routes and active-state behavior are preserved.
        ========================================================== */}
        <nav
          className="
            hidden
            h-full
            items-center
            gap-8
            font-medium
            md:flex
            lg:gap-12
          "
          aria-label="Main navigation"
        >
          {/* Home */}
          <Link
            href="/"
            className={`
              relative
              flex
              h-full
              items-center
              text-sm
              font-semibold
              transition-colors
              duration-200
              ${
                isActive("/")
                  ? "text-[#003898] dark:text-blue-400"
                  : "text-slate-600 hover:text-[#003898] dark:text-slate-300 dark:hover:text-blue-400"
              }
            `}
          >
            Home

            {isActive("/") && (
              <span
                className="
                  absolute
                  bottom-0
                  left-0
                  h-[3px]
                  w-full
                  rounded-full
                  bg-[#003898]
                  dark:bg-blue-400
                "
              />
            )}
          </Link>

          {/* Find Caretakers */}
          <Link
            href="/find-caretakers"
            className={`
              relative
              flex
              h-full
              items-center
              text-sm
              font-semibold
              transition-colors
              duration-200
              ${
                isActive("/find-caretakers")
                  ? "text-[#003898] dark:text-blue-400"
                  : "text-slate-600 hover:text-[#003898] dark:text-slate-300 dark:hover:text-blue-400"
              }
            `}
          >
            Find Caretakers

            {isActive("/find-caretakers") && (
              <span
                className="
                  absolute
                  bottom-0
                  left-0
                  h-[3px]
                  w-full
                  rounded-full
                  bg-[#003898]
                  dark:bg-blue-400
                "
              />
            )}
          </Link>

          {/* About Us */}
          <Link
            href="/about"
            className={`
              relative
              flex
              h-full
              items-center
              text-sm
              font-semibold
              transition-colors
              duration-200
              ${
                isActive("/about")
                  ? "text-[#003898] dark:text-blue-400"
                  : "text-slate-600 hover:text-[#003898] dark:text-slate-300 dark:hover:text-blue-400"
              }
            `}
          >
            About Us

            {isActive("/about") && (
              <span
                className="
                  absolute
                  bottom-0
                  left-0
                  h-[3px]
                  w-full
                  rounded-full
                  bg-[#003898]
                  dark:bg-blue-400
                "
              />
            )}
          </Link>

          {/* Contact Us */}
          <Link
            href="/contact"
            className={`
              relative
              flex
              h-full
              items-center
              text-sm
              font-semibold
              transition-colors
              duration-200
              ${
                isActive("/contact")
                  ? "text-[#003898] dark:text-blue-400"
                  : "text-slate-600 hover:text-[#003898] dark:text-slate-300 dark:hover:text-blue-400"
              }
            `}
          >
            Contact Us

            {isActive("/contact") && (
              <span
                className="
                  absolute
                  bottom-0
                  left-0
                  h-[3px]
                  w-full
                  rounded-full
                  bg-[#003898]
                  dark:bg-blue-400
                "
              />
            )}
          </Link>
        </nav>

        {/* =========================================================
            RIGHT SIDE
            Existing authentication buttons are preserved.
            Theme toggle is added without removing functionality.
        ========================================================== */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Dark / Light mode */}
          <ThemeToggle compact />

          {/* Login - preserved on all screen sizes */}
          <Link
            href="/login"
            className="
              rounded-xl
              border
              border-slate-300
              px-4
              py-2.5
              text-sm
              font-medium
              text-slate-700
              transition-all
              duration-200
              hover:border-[#003898]
              hover:text-[#003898]
              dark:border-slate-700
              dark:text-slate-200
              dark:hover:border-blue-400
              dark:hover:text-blue-300
              sm:px-6
              sm:py-3
            "
          >
            Log In
          </Link>

          {/* Sign Up - preserved */}
          <Link
            href="/signup"
            className="
              rounded-xl
              bg-[#003898]
              px-4
              py-2.5
              text-sm
              font-medium
              text-white
              transition-all
              duration-200
              hover:bg-[#002D73]
              dark:bg-blue-600
              dark:hover:bg-blue-500
              sm:px-6
              sm:py-3
            "
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}
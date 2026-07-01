"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";

export default function Navbar() {
  const pathname = usePathname();

  // Helper function to check if a specific route link is currently active
  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">

        {/* Logo */}
        <Logo />

        {/* Navigation - Hover states and active selections are now completely dynamic */}
        <nav className="hidden md:flex items-center gap-12 font-medium h-full">

          {/* Home Link */}
          <Link
            href="/"
            className={`relative flex items-center h-full text-sm font-semibold transition-colors duration-200 group ${
              isActive("/") 
                ? "text-[#003898]" 
                : "text-slate-600 hover:text-[#003898]"
            }`}
          >
            Home
            {isActive("/") && (
              <span className="absolute left-0 bottom-0 h-[3px] w-full rounded-full bg-[#003898]" />
            )}
          </Link>

          {/* Find Caretakers Link */}
          <Link
            href="/find-caretakers"
            className={`relative flex items-center h-full text-sm font-semibold transition-colors duration-200 group ${
              isActive("/find-caretakers") 
                ? "text-[#003898]" 
                : "text-slate-600 hover:text-[#003898]"
            }`}
          >
            Find Caretakers
            {isActive("/find-caretakers") && (
              <span className="absolute left-0 bottom-0 h-[3px] w-full rounded-full bg-[#003898]" />
            )}
          </Link>

          {/* About Us Link */}
          <Link
            href="/about"
            className={`relative flex items-center h-full text-sm font-semibold transition-colors duration-200 group ${
              isActive("/about") 
                ? "text-[#003898]" 
                : "text-slate-600 hover:text-[#003898]"
            }`}
          >
            About Us
            {isActive("/about") && (
              <span className="absolute left-0 bottom-0 h-[3px] w-full rounded-full bg-[#003898]" />
            )}
          </Link>

          {/* Contact Link */}
          <Link
            href="/contact"
            className={`relative flex items-center h-full text-sm font-semibold transition-colors duration-200 group ${
              isActive("/contact") 
                ? "text-[#003898]" 
                : "text-slate-600 hover:text-[#003898]"
            }`}
          >
            Contact Us
            {isActive("/contact") && (
              <span className="absolute left-0 bottom-0 h-[3px] w-full rounded-full bg-[#003898]" />
            )}
          </Link>
          
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">

          <Link
            href="/login"
            className="
              px-6 py-3
              border
              border-slate-300
              rounded-xl
              font-medium
              text-slate-700
              hover:border-[#003898]
              hover:text-[#003898]
              transition-all
              duration-200
            "
          >
            Log In
          </Link>

          <Link
            href="/signup"
            className="
              px-6 py-3
              rounded-xl
              bg-[#003898]
              text-white
              font-medium
              hover:bg-[#002D73]
              transition-all
              duration-200
            "
          >
            Sign Up
          </Link>

        </div>
      </div>
    </header>
  );
}
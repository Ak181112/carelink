import Link from "next/link";
import Logo from "./Logo";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">

        {/* Logo */}
        <Logo />

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-12 font-medium">

          <Link
            href="/"
            className="relative text-[#003898] font-semibold"
          >
            Home

            <span className="absolute left-0 -bottom-3 h-0.75 w-full rounded-full bg-[#003898]" />
          </Link>

          <Link
            href="/find-caretakers"
            className="text-slate-700 hover:text-[#003898] transition-colors"
          >
            Find Caretakers
          </Link>

          <Link
            href="/about"
            className="text-slate-700 hover:text-[#003898] transition-colors"
          >
            About Us
          </Link>

          <Link
            href="/contact"
            className="text-slate-700 hover:text-[#003898] transition-colors"
          >
            Contact
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
            "
          >
            Sign Up
          </Link>

        </div>
      </div>
    </header>
  );
}
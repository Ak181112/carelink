import {
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
} from "react-icons/fa";

import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="mt-16 mb-8 bg-white transition-colors duration-200 dark:bg-slate-950">

      <div
        className="
          mx-auto
          max-w-7xl
          rounded-[32px]
          border
          border-slate-300
          bg-white
          px-8
          py-10
          shadow-sm
          transition-colors
          duration-200
          dark:border-slate-700
          dark:bg-slate-900
        "
      >
        <div className="grid gap-10 md:grid-cols-4">

          {/* ======================================================
              LOGO SECTION
          ======================================================= */}
          <div>
            <Logo />

            <p className="mt-6 max-w-xs leading-8 text-gray-500 dark:text-slate-400">
              Connecting families with trusted caretakers
              for hospital and elderly care across Sri Lanka.
            </p>

            {/* Social Icons */}
            <div className="mt-6 flex gap-3">

              {/* Facebook */}
              <button
                type="button"
                aria-label="Facebook"
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-slate-200
                  text-slate-700
                  transition
                  hover:bg-slate-50
                  dark:border-slate-700
                  dark:text-slate-200
                  dark:hover:bg-slate-800
                "
              >
                <FaFacebookF size={16} />
              </button>

              {/* Instagram */}
              <button
                type="button"
                aria-label="Instagram"
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-slate-200
                  text-slate-700
                  transition
                  hover:bg-slate-50
                  dark:border-slate-700
                  dark:text-slate-200
                  dark:hover:bg-slate-800
                "
              >
                <FaInstagram size={16} />
              </button>

              {/* WhatsApp */}
              <button
                type="button"
                aria-label="WhatsApp"
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-slate-200
                  text-slate-700
                  transition
                  hover:bg-slate-50
                  dark:border-slate-700
                  dark:text-slate-200
                  dark:hover:bg-slate-800
                "
              >
                <FaWhatsapp size={16} />
              </button>

            </div>
          </div>

          {/* ======================================================
              QUICK LINKS
          ======================================================= */}
          <div>
            <h3 className="mb-5 text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">
              QUICK LINKS
            </h3>

            <div className="space-y-4 text-gray-600 dark:text-slate-300">

              <p className="cursor-pointer transition hover:text-[#003898] dark:hover:text-blue-400">
                Find Caretakers
              </p>

              <p className="cursor-pointer transition hover:text-[#003898] dark:hover:text-blue-400">
                About Us
              </p>

              <p className="cursor-pointer transition hover:text-[#003898] dark:hover:text-blue-400">
                Contact Us
              </p>

            </div>
          </div>

          {/* ======================================================
              LEGAL
          ======================================================= */}
          <div>
            <h3 className="mb-5 text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">
              LEGAL
            </h3>

            <div className="space-y-4 text-gray-600 dark:text-slate-300">

              <p className="cursor-pointer transition hover:text-[#003898] dark:hover:text-blue-400">
                Privacy Policy
              </p>

              <p className="cursor-pointer transition hover:text-[#003898] dark:hover:text-blue-400">
                Terms of Service
              </p>

              <p className="cursor-pointer transition hover:text-[#003898] dark:hover:text-blue-400">
                Cookie Policy
              </p>

            </div>
          </div>

          {/* ======================================================
              CONTACT
          ======================================================= */}
          <div>
            <h3 className="mb-5 text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">
              CONTACT US
            </h3>

            <div className="space-y-4 text-gray-600 dark:text-slate-300">

              {/* Phone */}
              <div className="flex items-center gap-3">
                <Phone size={16} className="shrink-0" />
                <span>+94 37 234 5678</span>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3">
                <Mail size={16} className="shrink-0" />
                <span>support@carelink.lk</span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-3">
                <MapPin size={16} className="shrink-0" />
                <span>Kurunegala, Sri Lanka</span>
              </div>

            </div>
          </div>

        </div>

        {/* ========================================================
            BOTTOM SECTION
        ========================================================= */}
        <div
          className="
            mt-8
            flex
            flex-col
            items-center
            justify-between
            gap-4
            border-t
            border-slate-200
            pt-8
            transition-colors
            duration-200
            md:flex-row
            dark:border-slate-700
          "
        >

          {/* Copyright */}
          <p className="text-sm text-gray-500 dark:text-slate-400">
            © 2026 CareLink+. All rights reserved.
          </p>

          {/* Bottom Legal Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500 dark:text-slate-400">

            <p className="cursor-pointer transition hover:text-[#003898] dark:hover:text-blue-400">
              Privacy Policy
            </p>

            <p className="cursor-pointer transition hover:text-[#003898] dark:hover:text-blue-400">
              Terms of Service
            </p>

            <p className="cursor-pointer transition hover:text-[#003898] dark:hover:text-blue-400">
              Cookie Policy
            </p>

          </div>

        </div>

      </div>
    </footer>
  );
}
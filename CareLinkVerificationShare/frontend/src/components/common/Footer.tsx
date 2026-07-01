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
    <footer className="bg-white mt-16 mb-8">

<div className="max-w-7xl mx-auto px-8 py-10 bg-white border border-slate-300 rounded-[32px] shadow-sm">        <div className="grid md:grid-cols-4 gap-10">

          {/* Logo Section */}
          <div>

            <Logo />

            <p className="mt-6 text-gray-500 leading-8 max-w-xs">
              Connecting families with trusted caretakers
              for hospital and elderly care across Sri Lanka.
            </p>

            {/* Social Icons */}
            <div className="flex gap-3 mt-6">

              <button className="w-10 h-10 border border-slate-200 rounded-full flex items-center justify-center hover:bg-slate-50 transition">
                <FaFacebookF size={16} />
              </button>

              <button className="w-10 h-10 border border-slate-200 rounded-full flex items-center justify-center hover:bg-slate-50 transition">
                <FaInstagram size={16} />
              </button>

              <button className="w-10 h-10 border border-slate-200 rounded-full flex items-center justify-center hover:bg-slate-50 transition">
                <FaWhatsapp size={16} />
              </button>

            </div>

          </div>

          {/* Quick Links */}
          <div>

            <h3 className="font-bold mb-5 uppercase text-sm tracking-wide">
              QUICK LINKS
            </h3>

            <div className="space-y-4 text-gray-600">

              <p className="hover:text-[#003898] cursor-pointer">
                Find Caretakers
              </p>

              <p className="hover:text-[#003898] cursor-pointer">
                About Us
              </p>

              <p className="hover:text-[#003898] cursor-pointer">
                Contact Us
              </p>

            </div>

          </div>

          {/* Legal */}
          <div>

            <h3 className="font-bold mb-5 uppercase text-sm tracking-wide">
              LEGAL
            </h3>

            <div className="space-y-4 text-gray-600">

              <p className="hover:text-[#003898] cursor-pointer">
                Privacy Policy
              </p>

              <p className="hover:text-[#003898] cursor-pointer">
                Terms of Service
              </p>

              <p className="hover:text-[#003898] cursor-pointer">
                Cookie Policy
              </p>

            </div>

          </div>

          {/* Contact */}
          <div>

            <h3 className="font-bold mb-5 uppercase text-sm tracking-wide">
              CONTACT US
            </h3>

            <div className="space-y-4 text-gray-600">

              <div className="flex items-center gap-3">
                <Phone size={16} />
                <span>+94 37 234 5678</span>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={16} />
                <span>support@carelink.lk</span>
              </div>

              <div className="flex items-center gap-3">
                <MapPin size={16} />
                <span>Kurunegala, Sri Lanka</span>
              </div>

            </div>

          </div>

        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-200 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">

          <p className="text-sm text-gray-500">
            © 2026 CareLink+. All rights reserved.
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">

            <p className="hover:text-[#003898] cursor-pointer">
              Privacy Policy
            </p>

            <p className="hover:text-[#003898] cursor-pointer">
              Terms of Service
            </p>

            <p className="hover:text-[#003898] cursor-pointer">
              Cookie Policy
            </p>

          </div>

        </div>

      </div>

    </footer>
  );
}
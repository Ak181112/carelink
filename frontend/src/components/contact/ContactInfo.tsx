import { Phone, Mail, MapPin, Clock } from "lucide-react";

export default function ContactInfo() {
  return (
    <div className="space-y-8">

      <div className="rounded-2xl border p-6">
        <Phone className="text-blue-600 mb-4" />
        <h3 className="font-semibold text-lg">Phone</h3>
        <p>+94 11 234 5678</p>
      </div>

      <div className="rounded-2xl border p-6">
        <Mail className="text-green-600 mb-4" />
        <h3 className="font-semibold text-lg">Email</h3>
        <p>support@carelink.lk</p>
      </div>

      <div className="rounded-2xl border p-6">
        <MapPin className="text-orange-500 mb-4" />
        <h3 className="font-semibold text-lg">Address</h3>
        <p>Kurunegala, Sri Lanka</p>
      </div>

      <div className="rounded-2xl border p-6">
        <Clock className="text-purple-500 mb-4" />
        <h3 className="font-semibold text-lg">Office Hours</h3>
        <p>Mon - Fri : 8AM - 8PM</p>
      </div>

    </div>
  );
}
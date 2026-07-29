"use client";

import { useState } from "react";
import { formatPhoneNumber } from "@/lib/phoneUtils";
import { contactAPI } from "@/services/api";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await contactAPI.submit({ name, email, phone, subject, message });
      setSuccess("Thanks! Your message has been sent — we'll get back to you soon.");
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border p-8">

      <h2 className="text-3xl font-bold mb-6">
        Send Us a Message
      </h2>

      {success && (
        <div className="mb-4 rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border rounded-xl p-4"
        />

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border rounded-xl p-4"
        />

      </div>

      <input
        type="tel"
        placeholder="Phone Number (e.g. 0712345678)"
        value={phone}
        maxLength={10}
        onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
        className="border rounded-xl p-4 mt-4 w-full"
      />

      <input
        type="text"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="border rounded-xl p-4 mt-4 w-full"
      />

      <textarea
        rows={6}
        placeholder="Your Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        className="border rounded-xl p-4 mt-4 w-full"
      />

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-2xl bg-[#003898] py-4 text-white font-semibold hover:bg-[#002D73] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Sending..." : "Send message"}
      </button>

    </form>
  );
}
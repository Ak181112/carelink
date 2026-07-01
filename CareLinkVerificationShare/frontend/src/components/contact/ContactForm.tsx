export default function ContactForm() {
  return (
    <div className="rounded-2xl border p-8">

      <h2 className="text-3xl font-bold mb-6">
        Send Us a Message
      </h2>

      <div className="grid md:grid-cols-2 gap-4">

        <input
          type="text"
          placeholder="Full Name"
          className="border rounded-xl p-4"
        />

        <input
          type="email"
          placeholder="Email Address"
          className="border rounded-xl p-4"
        />

      </div>

      <input
        type="text"
        placeholder="Phone Number"
        className="border rounded-xl p-4 mt-4 w-full"
      />

      <input
        type="text"
        placeholder="Subject"
        className="border rounded-xl p-4 mt-4 w-full"
      />

      <textarea
        rows={6}
        placeholder="Your Message"
        className="border rounded-xl p-4 mt-4 w-full"
      />

      <button className="mt-6 w-full rounded-2xl bg-[#003898] py-4 text-white font-semibold hover:bg-[#002D73] transition flex items-center justify-center gap-2 cursor-pointer">
        Send message
      </button>

    </div>
  );
}
export default function BookingCard() {
  return (
    <div className="bg-white rounded-3xl shadow-sm p-8 h-fit">

      <h2 className="text-4xl font-bold text-blue-600">
        LKR 1,500
      </h2>

      <p className="text-gray-500">
        Per Visit
      </p>

      <button className="w-full mt-8 rounded-xl bg-blue-600 py-4 text-white font-semibold">
        Request Booking
      </button>

    </div>
  );
}
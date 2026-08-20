import BookingCard from "./BookingCard";
import { CaretakerProfile } from "@/types";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace("/api", "");

function getImageUrl(photo?: string) {
  if (!photo) return null;
  if (photo.startsWith("http")) return photo;
  return `${API_BASE}${photo}`;
}

interface Props {
  caretaker: CaretakerProfile;
}

export default function CaretakerProfileHero({ caretaker }: Props) {
  const imageUrl = getImageUrl(caretaker.photo);

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="grid lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm p-8">

          <div className="flex gap-6 items-center">
            <div className="w-32 h-32 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-3xl font-bold text-slate-400">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- external backend-served upload, not whitelisted for next/image
                <img src={imageUrl} alt={caretaker.fullName} className="h-full w-full object-cover" />
              ) : (
                caretaker.fullName?.charAt(0) ?? "?"
              )}
            </div>

            <div>
              <h1 className="text-4xl font-bold">
                {caretaker.fullName}
              </h1>

              <p className="text-gray-500 mt-2">
                {caretaker.town || caretaker.district}
              </p>

              <div className="mt-4 flex gap-4 text-sm">
                <span>⭐ {caretaker.averageRating > 0 ? caretaker.averageRating.toFixed(1) : "New"} Rating</span>
                <span>{caretaker.experience} Experience</span>
              </div>
            </div>
          </div>

          {caretaker.qualifications && (
            <p className="mt-8 text-gray-600 leading-relaxed">
              {caretaker.qualifications}
            </p>
          )}

        </div>

        <BookingCard caretaker={caretaker} />

      </div>
    </section>
  );
}

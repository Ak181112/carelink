"use client";

import { useAuth } from "@/contexts/AuthContext";
import ReviewForm from "./ReviewForm";
import { Review } from "@/types";

interface Props {
  caretakerId: string;
  reviews: Review[];
  onReviewsChange: (reviews: Review[], averageRating: number) => void;
}

export default function ReviewsSection({
  caretakerId,
  reviews,
  onReviewsChange,
}: Props) {
  const { user } = useAuth();

  const myReview =
    reviews.find((review) => review.clientId === (user?.id ?? user?._id)) ?? null;

  const others = reviews.filter((review) => review !== myReview);

  const renderReview = (review: Review, isMine: boolean) => (
    <div
      key={review._id}
      className={`bg-white rounded-3xl shadow-sm p-8 ${
        isMine ? "border-2 border-blue-100" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-lg">{review.clientName}</h3>
        {isMine && (
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600">
            Your review
          </span>
        )}
      </div>

      <p className="text-yellow-500 mt-2">{"⭐".repeat(review.rating)}</p>

      {review.comment && <p className="mt-4 text-gray-600">{review.comment}</p>}

      <p className="mt-3 text-xs text-slate-400">
        {new Date(review.createdAt).toLocaleDateString()}
      </p>
    </div>
  );

  return (
    <section className="max-w-7xl mx-auto px-6 pb-20">
      <h2 className="text-3xl font-bold mb-6">
        Reviews{reviews.length > 0 && ` (${reviews.length})`}
      </h2>

      <ReviewForm
        caretakerId={caretakerId}
        myReview={myReview}
        onSaved={onReviewsChange}
      />

      {reviews.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm p-8 text-gray-500">
          No reviews yet.
        </div>
      ) : (
        <div className="space-y-4">
          {/* the reviewer's own review first, so they can find it easily */}
          {myReview && renderReview(myReview, true)}
          {others.map((review) => renderReview(review, false))}
        </div>
      )}
    </section>
  );
}

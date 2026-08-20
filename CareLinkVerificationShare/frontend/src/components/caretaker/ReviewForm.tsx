"use client";

import { useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { caretakerAPI } from "@/services/api";
import { Review } from "@/types";

interface Props {
  caretakerId: string;
  myReview: Review | null;
  onSaved: (reviews: Review[], averageRating: number) => void;
}

export default function ReviewForm({ caretakerId, myReview, onSaved }: Props) {
  const { user, loading: authLoading } = useAuth();

  const [rating, setRating] = useState(myReview?.rating ?? 0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState(myReview?.comment ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Only family members book care, so only they can rate a caretaker
  if (authLoading || user?.role === "caretaker" || user?.role === "admin") {
    return null;
  }

  if (!user) {
    return (
      <div className="bg-white rounded-3xl shadow-sm p-8 mb-6 text-center">
        <p className="text-slate-600">
          <Link href="/login" className="font-semibold text-blue-600 hover:underline">
            Log in
          </Link>{" "}
          as a family member to leave a review for this caretaker.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (rating < 1) {
      setError("Please select a rating between 1 and 5 stars.");
      return;
    }

    setSaving(true);
    try {
      const data = await caretakerAPI.addReview(caretakerId, {
        rating,
        comment: comment.trim(),
      });

      setSuccess(data.message || "Thank you for your review");
      onSaved(data.reviews ?? [], data.averageRating ?? 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save your review");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete your review for this caretaker?")) return;

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const data = await caretakerAPI.deleteReview(caretakerId);
      setRating(0);
      setComment("");
      setSuccess("Your review has been deleted");
      onSaved(data.reviews ?? [], data.averageRating ?? 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete your review");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm p-8 mb-6 space-y-5">
      <h3 className="text-lg font-bold text-slate-900">
        {myReview ? "Update your review" : "Write a review"}
      </h3>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Your rating *</label>

        <div className="flex items-center gap-1" onMouseLeave={() => setHovered(0)}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              aria-label={`${value} star${value > 1 ? "s" : ""}`}
              onClick={() => setRating(value)}
              onMouseEnter={() => setHovered(value)}
              className="p-0.5 transition hover:scale-110"
            >
              <Star
                className={`h-7 w-7 ${
                  value <= (hovered || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-slate-300"
                }`}
              />
            </button>
          ))}

          {rating > 0 && (
            <span className="ml-2 text-sm text-slate-500">{rating} / 5</span>
          )}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Your comment
        </label>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Share how this caretaker supported your family..."
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-600"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : myReview ? "Update Review" : "Submit Review"}
        </button>

        {myReview && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="rounded-xl border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
          >
            Delete Review
          </button>
        )}
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, ArrowLeft, MessageSquare, ShieldAlert, Heart } from "lucide-react";

export default function RatingPage() {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a star rating score before submitting.");
      return;
    }
    setIsSubmitted(true);
  };

  // UI Helper to match custom text descriptions to the star selection score
  const getFeedbackLabel = (score: number) => {
    if (score === 5) return "Excellent service, highly recommended!";
    if (score === 4) return "Good, satisfied with the care provided.";
    if (score === 3) return "Average performance, could improve areas.";
    if (score <= 2 && score > 0) return "Disappointed with aspects of the job.";
    return "Select your care placement score rating";
  };

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-[#DFE1E6] p-8 text-center shadow-sm">
        <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100">
          <Star size={28} className="fill-current" />
        </div>
        <h2 className="text-xl font-bold text-[#091E42] tracking-tight">Review Submitted</h2>
        <p className="text-xs text-[#42526E] mt-1.5 px-4">
          Thank you for rating your service. Your feedback plays a critical role in maintaining safety standards across the Kurunegala district community ecosystem.
        </p>
        <Link 
          href="/find-caretakers" 
          className="mt-6 inline-block px-5 py-2 text-xs font-bold text-[#0052CC] bg-[#EEF5FF] rounded-lg hover:bg-blue-100 transition"
        >
          Return to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      {/* Cancel Navigation */}
      <Link href="/find-caretakers" className="inline-flex items-center gap-2 text-sm text-[#42526E] hover:text-[#0052CC] mb-6 font-medium group">
        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> Cancel Review
      </Link>

      <div className="bg-white rounded-2xl border border-[#DFE1E6] shadow-sm p-6">
        {/* Header Block */}
        <div className="border-b border-gray-100 pb-4 mb-6">
          <h1 className="text-xl font-bold text-[#091E42] tracking-tight">Leave a Review</h1>
          <p className="text-xs text-[#42526E] mt-0.5">Rate your recent care experience with <span className="font-semibold text-gray-900">Anura Perera</span></p>
        </div>

        <form onSubmit={handleSubmitReview} className="space-y-6">
          {/* Interactive Star Bar Container */}
          <div className="text-center bg-gray-50/50 rounded-2xl p-6 border border-[#DFE1E6]/60">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#42526E] mb-3">Overall Performance Rating</label>
            
            <div className="flex items-center justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((index) => {
                const isActive = index <= (hoverRating || rating);
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setRating(index)}
                    onMouseEnter={() => setHoverRating(index)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-gray-200 transition-transform active:scale-95 focus:outline-none"
                  >
                    <Star 
                      size={36} 
                      className={`transition-colors cursor-pointer ${
                        isActive ? "text-amber-400 fill-amber-400" : "text-gray-200"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            
            <p className={`text-xs font-semibold ${rating > 0 ? "text-amber-600" : "text-gray-400"}`}>
              {getFeedbackLabel(hoverRating || rating)}
            </p>
          </div>

          {/* Written Feedback Entry */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#42526E] mb-2 flex items-center gap-1.5">
              <MessageSquare size={14} className="text-gray-400" /> Share Your Detailed Experience
            </label>
            <textarea
              required
              rows={4}
              placeholder="What did they do well? Were they on time? How was their communication style..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full rounded-xl border border-[#DFE1E6] p-4 text-sm outline-none transition-all focus:border-[#0052CC] focus:ring-2 focus:ring-blue-50 resize-y min-h-[100px]"
            />
          </div>

          {/* Privacy Toggle Panel */}
          <div className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="mt-1 h-4 w-4 accent-[#0052CC] rounded cursor-pointer"
            />
            <div className="text-xs">
              <label htmlFor="anonymous" className="font-bold text-[#091E42] cursor-pointer block">Post review anonymously</label>
              <p className="text-[#42526E] mt-0.5">Your name will be hidden from public dashboards, but the caretaker receives the metrics privately.</p>
            </div>
          </div>

          {/* Guidelines Banner */}
          <div className="text-[11px] text-gray-400 space-y-1.5 bg-gray-50/30 p-3 rounded-xl border border-dashed border-gray-200">
            <p className="font-semibold flex items-center gap-1 text-[#42526E]"><ShieldAlert size={12} /> Review Verification Policies:</p>
            <p>• Only submit reviews for completed active placement windows.</p>
            <p>• Keep comments professional, helpful, and respectful to individual privacy.</p>
          </div>

          {/* Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href="/find-caretakers" className="px-4 py-2 rounded-xl text-sm font-semibold text-[#42526E] hover:bg-gray-50 transition">
              Cancel
            </Link>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0052CC] text-sm font-semibold text-white hover:bg-[#0747A6] shadow-sm transition active:scale-[0.98]"
            >
              Publish Caregiver Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
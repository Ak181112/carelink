// "use client";
// import { useState } from "react";
// import { useSearchParams,useRouter } from "next/navigation";
// import { feedbackAPI } from "@/services/api";
// export default function FeedbackPage(){const p=useSearchParams();const r=useRouter();const id=p.get("bookingId")||"";const [rating,setRating]=useState(5);const [comment,setComment]=useState("");const [busy,setBusy]=useState(false);const [error,setError]=useState("");const submit=async()=>{setBusy(true);setError("");try{await feedbackAPI.create({bookingId:id,rating,comment,wouldRecommend:true});r.push('/client/bookings');}catch(e:any){setError(e.message)}finally{setBusy(false)}};return <div className="min-h-screen bg-slate-50 p-4 sm:p-6 grid place-items-center"><div className="w-full max-w-2xl bg-white border rounded-2xl shadow-sm p-6 sm:p-8"><p className="text-sm font-semibold text-[#003898]">Post-service feedback</p><h1 className="text-3xl font-extrabold mt-1">How was the care?</h1><p className="text-slate-500 mt-2">Your rating becomes part of the caretaker profile and recommendation score.</p><div className="mt-7"><p className="font-semibold">Rating</p><div className="flex gap-2 mt-3">{[1,2,3,4,5].map(n=><button key={n} onClick={()=>setRating(n)} className={`text-4xl ${n<=rating?'text-amber-400':'text-slate-300'}`}>★</button>)}</div></div><textarea value={comment} onChange={e=>setComment(e.target.value)} rows={6} placeholder="Tell us what went well or what should improve" className="mt-6 w-full rounded-xl border px-4 py-3"/><button onClick={submit} disabled={busy} className="mt-5 w-full rounded-xl bg-[#003898] text-white py-3 font-semibold disabled:opacity-50">Submit feedback</button>{error&&<div className="mt-4 bg-red-50 text-red-700 rounded-xl p-3 text-sm">{error}</div>}</div></div>}

"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  MessageSquareText,
  Star,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import { feedbackAPI } from "@/services/api";

export default function FeedbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const bookingId =
    searchParams.get("bookingId")?.trim() || "";

  const [rating, setRating] =
    useState<number>(5);

  const [comment, setComment] =
    useState("");

  const [wouldRecommend, setWouldRecommend] =
    useState(true);

  const [busy, setBusy] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const ratingLabel = useMemo(() => {
    switch (rating) {
      case 5:
        return "Excellent";

      case 4:
        return "Very Good";

      case 3:
        return "Good";

      case 2:
        return "Needs Improvement";

      case 1:
        return "Poor";

      default:
        return "";
    }
  }, [rating]);

  const submit = async () => {
    setError("");
    setSuccess("");

    /* ========================================================
       BOOKING ID VALIDATION
    ======================================================== */

    if (!bookingId) {
      setError(
        "This feedback page does not have a valid booking reference."
      );
      return;
    }

    /* ========================================================
       COMMENT VALIDATION
    ======================================================== */

    const trimmedComment =
      comment.trim();

    if (trimmedComment.length > 5000) {
      setError(
        "Your feedback must not exceed 5,000 characters."
      );
      return;
    }

    /* ========================================================
       SUBMIT
    ======================================================== */

    try {
      setBusy(true);

      await feedbackAPI.create({
        bookingId,
        rating,
        comment: trimmedComment,
        wouldRecommend,
      });

      setSuccess(
        "Thank you. Your feedback has been submitted successfully."
      );

      /*
       * Give the user a moment to see the success
       * confirmation before returning to bookings.
       */
      window.setTimeout(() => {
        router.push("/client/bookings");
      }, 900);
    } catch (e: unknown) {
      setError(
        e instanceof Error
          ? e.message
          : "Unable to submit feedback."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 dark:bg-slate-950">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-2xl place-items-center">
        <div className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {/* ==================================================
              HEADER
          =================================================== */}

          <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-7 sm:px-8 dark:border-slate-800 dark:bg-slate-950/50">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#003898] dark:bg-blue-950/40 dark:text-blue-400">
                <MessageSquareText className="h-6 w-6" />
              </div>

              <div>
                <p className="text-sm font-semibold text-[#003898] dark:text-blue-400">
                  Post-service feedback
                </p>

                <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#091E42] dark:text-white">
                  How was the care?
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Your feedback helps CareLink+ monitor
                  service quality and contributes to the
                  caretaker's profile and recommendation
                  score.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-7 p-6 sm:p-8">
            {/* ==================================================
                BOOKING VALIDATION
            =================================================== */}

            {!bookingId && (
              <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                <div>
                  <p className="font-semibold">
                    Invalid booking reference
                  </p>

                  <p className="mt-1 leading-5">
                    Feedback must be submitted from a
                    valid CareLink+ booking.
                  </p>
                </div>
              </div>
            )}

            {/* ==================================================
                RATING
            =================================================== */}

            <section>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Overall Rating
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Rate your experience from 1 to 5 stars.
                  </p>
                </div>

                <span className="text-sm font-bold text-[#003898] dark:text-blue-400">
                  {ratingLabel}
                </span>
              </div>

              <div
                className="mt-4 flex items-center gap-2"
                role="radiogroup"
                aria-label="Rating"
              >
                {[1, 2, 3, 4, 5].map(
                  (value) => {
                    const selected =
                      value <= rating;

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setRating(value)
                        }
                        disabled={busy}
                        aria-label={`${value} star${
                          value === 1
                            ? ""
                            : "s"
                        }`}
                        aria-pressed={
                          value === rating
                        }
                        className="rounded-xl p-1 transition hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#003898]/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Star
                          className={`h-9 w-9 transition sm:h-10 sm:w-10 ${
                            selected
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-300 dark:text-slate-700"
                          }`}
                        />
                      </button>
                    );
                  }
                )}
              </div>

              <div className="mt-3 flex justify-between text-xs text-slate-400">
                <span>
                  1 — Poor
                </span>

                <span>
                  5 — Excellent
                </span>
              </div>
            </section>

            {/* ==================================================
                RECOMMENDATION
            =================================================== */}

            <section>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Would you recommend this caretaker?
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  This contributes to the caretaker's
                  recommendation score.
                </p>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() =>
                    setWouldRecommend(true)
                  }
                  disabled={busy}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    wouldRecommend
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <ThumbsUp className="h-4 w-4" />
                  Yes, I would recommend
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setWouldRecommend(false)
                  }
                  disabled={busy}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    !wouldRecommend
                      ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <ThumbsDown className="h-4 w-4" />
                  No, I would not recommend
                </button>
              </div>
            </section>

            {/* ==================================================
                COMMENT
            =================================================== */}

            <section>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Written Feedback
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Tell us what went well or what should
                    improve.
                  </p>
                </div>

                <span className="text-xs text-slate-400">
                  {comment.length}/5000
                </span>
              </div>

              <textarea
                value={comment}
                onChange={(event) =>
                  setComment(
                    event.target.value
                  )
                }
                rows={6}
                maxLength={5000}
                disabled={busy}
                placeholder="Tell us what went well or what should improve..."
                className="mt-4 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-[#003898] focus:bg-white focus:ring-4 focus:ring-[#003898]/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-900"
              />
            </section>

            {/* ==================================================
                ELIGIBILITY INFORMATION
            =================================================== */}

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />

                <div>
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                    Post-service feedback
                  </p>

                  <p className="mt-1 text-xs leading-5 text-blue-700 dark:text-blue-400">
                    Feedback is available only for a
                    legitimate completed CareLink+ service
                    that has been successfully paid.
                  </p>
                </div>
              </div>
            </div>

            {/* ==================================================
                SUCCESS / ERROR
            =================================================== */}

            {success && (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                {success}
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-semibold text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* ==================================================
                SUBMIT
            =================================================== */}

            <button
              type="button"
              onClick={submit}
              disabled={
                busy ||
                !bookingId
              }
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#003898] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0747A6] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Submitting Feedback...
                </>
              ) : (
                <>
                  <MessageSquareText className="h-5 w-5" />
                  Submit Feedback
                </>
              )}
            </button>

            <p className="text-center text-xs leading-5 text-slate-400">
              Your feedback will be associated with this
              booking and used to improve CareLink+ service
              quality.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
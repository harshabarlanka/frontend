/**
 * InlineReviewSection
 *
 * Renders a review panel inline (no modal) for a single product.
 * Two states:
 *   1. existingReview present → read-only display with optional Verified Purchase badge
 *   2. no review              → star + textarea + submit form
 *
 * Props
 * ─────
 *  productId        string   – MongoDB ObjectId of the product
 *  productName      string   – for aria / display
 *  variantId        string   – optional
 *  variantSize      string   – optional label
 *  orderId          string   – if linked to a delivered order (enables verified purchase)
 *  isDelivered      bool     – whether the linked order is delivered
 *  existingReview   object   – { rating, comment, verifiedPurchase, createdAt } | null
 *  onReviewSubmit   fn(review) – called after a successful submission
 *  compact          bool     – tighter layout for OrdersPage card (default false)
 */

import { useState } from "react";
import { addReviewAPI } from "../../api/product.api";
import { getErrorMessage } from "../../utils";
import toast from "react-hot-toast";

/* ─── Star display (read-only) ───────────────────────────────────── */
const StarDisplay = ({ rating, size = "base" }) => (
  <div className="flex">
    {[1, 2, 3, 4, 5].map((s) => (
      <span
        key={s}
        className={`${size === "sm" ? "text-sm" : "text-base"} ${
          s <= rating ? "text-amber-400" : "text-gray-200"
        }`}
      >
        ★
      </span>
    ))}
  </div>
);

/* ─── Star picker (interactive) ──────────────────────────────────── */
const StarPicker = ({ value, onChange, disabled }) => {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;
  const labels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="text-2xl transition-transform duration-75 hover:scale-110 focus:outline-none disabled:cursor-not-allowed"
            aria-label={`Rate ${star} out of 5`}
          >
            <span className={star <= active ? "text-amber-400" : "text-gray-200"}>★</span>
          </button>
        ))}
      </div>
      {active > 0 && (
        <span className="text-[11px] font-semibold text-amber-600 font-body">
          {labels[active]}
        </span>
      )}
    </div>
  );
};

/* ─── Verified Purchase badge ────────────────────────────────────── */
const VerifiedBadge = () => (
  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
    Verified Purchase
  </span>
);

/* ─── Main component ──────────────────────────────────────────────── */
const InlineReviewSection = ({
  productId,
  productName,
  variantId,
  variantSize,
  orderId,
  isDelivered,
  existingReview,
  onReviewSubmit,
  compact = false,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating.");
      return;
    }
    try {
      setSubmitting(true);
      const payload = { rating, comment };
      if (orderId) payload.orderId = orderId;
      if (variantId) payload.variantId = variantId;
      const { data } = await addReviewAPI(productId, payload);

      const submittedReview = {
        rating,
        comment,
        verifiedPurchase: isDelivered && !!orderId
          ? true
          : !!data?.data?.verifiedPurchase,
        createdAt: new Date().toISOString(),
      };

      toast.success("Review submitted! Thank you 🙏");
      onReviewSubmit?.(submittedReview);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Existing review (read-only) ──────────────────────────────── */
  if (existingReview) {
    if (compact) {
      // OrdersPage card — tightest layout
      return (
        <div className="flex flex-col gap-1 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="flex flex-wrap items-center gap-2">
            <StarDisplay rating={existingReview.rating} size="sm" />
            <span className="text-[11px] font-bold text-earth-700">
              {existingReview.rating.toFixed(1)}
            </span>
            {existingReview.verifiedPurchase && isDelivered && (
              <VerifiedBadge />
            )}
          </div>
          {existingReview.comment && (
            <p className="text-[11px] text-earth-600 italic line-clamp-2">
              "{existingReview.comment}"
            </p>
          )}
        </div>
      );
    }

    // Full read-only layout (OrderDetailPage / ProductDetailPage)
    return (
      <div className="flex flex-col gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
        <div className="flex flex-wrap items-center gap-2">
          <StarDisplay rating={existingReview.rating} />
          <span className="text-sm font-bold text-earth-800">
            {existingReview.rating.toFixed(1)}
          </span>
          {existingReview.verifiedPurchase && isDelivered && (
            <VerifiedBadge />
          )}
        </div>
        {existingReview.comment && (
          <p className="text-sm text-earth-700 italic leading-relaxed">
            "{existingReview.comment}"
          </p>
        )}
        <p className="text-[10px] text-earth-400">
          Your review · {new Date(existingReview.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>
    );
  }

  /* ── No review yet — inline form ──────────────────────────────── */
  if (compact) {
    // OrdersPage card — compact inline form
    return (
      <form onSubmit={handleSubmit} className="p-2.5 bg-earth-50 border border-earth-200 rounded-xl space-y-2">
        <p className="text-[11px] font-bold text-earth-500 uppercase tracking-wide">
          Rate this item
        </p>
        <StarPicker value={rating} onChange={setRating} disabled={submitting} />
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience (optional)"
          rows={2}
          maxLength={500}
          disabled={submitting}
          className="w-full border border-earth-200 rounded-lg px-3 py-2 text-xs font-body text-earth-800 placeholder-earth-300 resize-none focus:outline-none focus:border-brand-400 transition-colors disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={submitting || rating === 0}
          className="w-full py-1.5 rounded-lg bg-[#4A1F14] text-white font-body font-bold text-xs hover:bg-[#3A160F] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting…" : "Submit Review"}
        </button>
      </form>
    );
  }

  // Full inline form (OrderDetailPage / ProductDetailPage)
  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-earth-50 border border-earth-200 rounded-xl space-y-3"
    >
      <p className="text-xs font-bold text-earth-500 uppercase tracking-wide">
        Rate this product
        {/* {isDelivered && orderId && (
          <span className="ml-2 normal-case font-normal text-emerald-600">
            · will be marked as Verified Purchase
          </span>
        )} */}
      </p>

      <div>
        <StarPicker value={rating} onChange={setRating} disabled={submitting} />
      </div>

      <div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you like or dislike? (optional)"
          rows={3}
          maxLength={500}
          disabled={submitting}
          className="w-full border-2 border-earth-200 rounded-xl px-4 py-2.5 text-sm font-body text-earth-800 placeholder-earth-300 resize-none focus:outline-none focus:border-brand-400 transition-colors disabled:opacity-60"
        />
        <p className="text-right text-[10px] text-earth-400 -mt-1">{comment.length}/500</p>
      </div>

      <button
        type="submit"
        disabled={submitting || rating === 0}
        className="w-full py-2.5 rounded-xl bg-[#4A1F14] text-white font-body font-bold text-sm hover:bg-[#3A160F] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
};

export default InlineReviewSection;

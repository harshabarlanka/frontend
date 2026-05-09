import { useState, useEffect, useRef } from "react";
import { addReviewAPI } from "../../api/product.api";
import { getErrorMessage } from "../../utils";
import toast from "react-hot-toast";

/* ─── Interactive star picker ─────────────────────────────────── */
const StarPicker = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  const labels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="text-3xl transition-transform duration-100 hover:scale-110 focus:outline-none"
            aria-label={`Rate ${star} out of 5`}
          >
            <span
              className={
                star <= active ? "text-amber-400" : "text-gray-200"
              }
            >
              ★
            </span>
          </button>
        ))}
      </div>
      {active > 0 && (
        <span className="text-xs font-semibold text-amber-600 font-body">
          {labels[active]}
        </span>
      )}
    </div>
  );
};

/* ─── Review Modal ────────────────────────────────────────────── */
const ReviewModal = ({
  isOpen,
  onClose,
  productId,
  productName,
  productImage,
  variantId,
  variantSize,
  orderId,         // if coming from order → auto verified purchase
  onSuccess,       // callback(review) after success
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const overlayRef = useRef(null);
  const textareaRef = useRef(null);

  /* reset on open */
  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setComment("");
      setSubmitting(false);
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [isOpen]);

  /* close on Escape */
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  /* lock body scroll */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { toast.error("Please select a rating."); return; }
    try {
      setSubmitting(true);
      const payload = { rating, comment };
      if (orderId) payload.orderId = orderId;
      if (variantId) payload.variantId = variantId;
      const { data } = await addReviewAPI(productId, payload);
      toast.success("Review submitted! Thank you 🙏");
      onSuccess?.({
        rating,
        comment,
        name: "You",
        verifiedPurchase: !!orderId || data?.data?.verifiedPurchase,
        createdAt: new Date().toISOString(),
      });
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white w-full sm:max-w-md sm:mx-4 sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="font-display font-bold text-earth-900 text-lg leading-tight">
              Rate this product
            </h2>
            <p className="text-xs text-earth-500 font-body mt-0.5">
              Your review helps other shoppers
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-earth-100 flex items-center justify-center text-earth-500 hover:bg-earth-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Product preview */}
        {productName && (
          <div className="flex items-center gap-3 px-6 py-3 bg-earth-50 border-b border-earth-100">
            <div className="w-12 h-12 rounded-xl bg-earth-100 overflow-hidden flex items-center justify-center text-2xl flex-shrink-0">
              {productImage ? (
                <img src={productImage} alt={productName} className="w-full h-full object-cover" />
              ) : "🫙"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body font-bold text-earth-900 text-sm leading-tight truncate">
                {productName}
              </p>
              {variantSize && (
                <p className="text-xs text-earth-500">{variantSize}</p>
              )}
              {orderId && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full mt-1">
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Verified Purchase
                </span>
              )}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Stars */}
          <div>
            <label className="block text-sm font-bold text-earth-700 font-body mb-2">
              Your Rating <span className="text-red-500">*</span>
            </label>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-bold text-earth-700 font-body mb-2">
              Your Review <span className="text-earth-400 font-normal">(optional)</span>
            </label>
            <textarea
              ref={textareaRef}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like or dislike? Would you recommend this?"
              rows={4}
              maxLength={500}
              className="w-full border-2 border-earth-200 rounded-xl px-4 py-3 text-sm font-body text-earth-800 placeholder-earth-300 resize-none focus:outline-none focus:border-brand-400 transition-colors"
            />
            <p className="text-right text-xs text-earth-400 mt-1">{comment.length}/500</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 border-earth-200 text-earth-600 font-body font-bold text-sm hover:bg-earth-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="flex-1 py-3 rounded-xl bg-[#4A1F14] text-white font-body font-bold text-sm hover:bg-[#3A160F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting…" : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;

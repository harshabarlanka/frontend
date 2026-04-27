import { useState } from "react";

const StarRating = ({
  rating = 0,
  count,
  size = "sm",
  interactive = false,
  onRate,
  className = "",
}) => {
  const [hovered, setHovered] = useState(0);

  const sizeCls =
    {
      sm: "text-[14px]",
      md: "text-[18px]",
      lg: "text-[22px]",
    }[size] || "text-[14px]";

  // ✅ Interactive mode (no changes needed)
  if (interactive) {
    const active = hovered || rating;

    return (
      <div className={`flex gap-[2px] ${className}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRate?.(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className={`${sizeCls} transition-all duration-150 hover:scale-125 ${
              star <= active ? "text-brand-500" : "text-earth-200"
            }`}
          >
            ★
          </button>
        ))}
      </div>
    );
  }

  // ✅ Non-interactive (FIXED spacing)
  const numericRating = Number(rating) || 0;

  return (
    <div className={`flex items-center gap-[2px] ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        let color = "text-earth-200";

        if (star <= Math.floor(numericRating)) {
          color = "text-brand-500"; // full
        } else if (
          star === Math.floor(numericRating) + 1 &&
          numericRating % 1 >= 0.5
        ) {
          color = "text-brand-300"; // half (lighter)
        }

        return (
          <span key={star} className={`${sizeCls} leading-none ${color}`}>
            ★
          </span>
        );
      })}

      {count !== undefined && (
        <span className="text-xs text-earth-500 ml-1">({count})</span>
      )}
    </div>
  );
};

export default StarRating;

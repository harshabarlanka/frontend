import { useState } from "react";

const Star = ({ fill = "empty", size = 14 }) => {
  const id = `half-${Math.random().toString(36).slice(2, 8)}`;

  if (fill === "full") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-brand-500">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    );
  }

  if (fill === "half") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24">
        <defs>
          <linearGradient id={id}>
            <stop offset="50%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#e5e7eb" />
          </linearGradient>
        </defs>
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill={`url(#${id})`}
        />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-earth-200">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
};

const SIZE_MAP = { sm: 14, md: 18, lg: 22 };

const StarRating = ({
  rating = 0,
  count,
  size = "sm",
  interactive = false,
  onRate,
  className = "",
}) => {
  const [hovered, setHovered] = useState(0);
  const px = SIZE_MAP[size] || 14;
  const numericRating = Number(rating) || 0;

  if (interactive) {
    const active = hovered || numericRating;
    return (
      <div className={`flex gap-[2px] ${className}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRate?.(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform duration-150 hover:scale-125"
          >
            <svg
              width={px}
              height={px}
              viewBox="0 0 24 24"
              fill="currentColor"
              className={star <= active ? "text-brand-500" : "text-earth-200"}
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-[2px] ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const full = star <= Math.floor(numericRating);
        const half =
          !full &&
          star === Math.floor(numericRating) + 1 &&
          numericRating % 1 >= 0.3;

        return (
          <Star
            key={star}
            fill={full ? "full" : half ? "half" : "empty"}
            size={px}
          />
        );
      })}

      {count !== undefined && (
        <span className="text-xs text-earth-500 ml-1">({count})</span>
      )}
    </div>
  );
};

export default StarRating;

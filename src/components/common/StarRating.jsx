import { useState } from 'react'

const StarRating = ({
  rating = 0,
  count,
  size = 'sm',
  interactive = false,
  onRate,
  className = '',
}) => {
  const [hovered, setHovered] = useState(0)

  const sizeCls = {
    sm:  'text-sm',
    md:  'text-xl',
    lg:  'text-2xl',
  }[size] || 'text-sm'

  if (interactive) {
    const active = hovered || rating
    return (
      <div className={`flex gap-1 ${className}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRate?.(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className={`${sizeCls} transition-all duration-150 hover:scale-125 focus:outline-none ${
              star <= active ? 'text-brand-500' : 'text-earth-200'
            }`}
          >
            ★
          </button>
        ))}
      </div>
    )
  }

  const full  = Math.floor(rating)
  const half  = rating % 1 >= 0.5 ? 1 : 0
  const empty = 5 - full - half

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className={`${sizeCls} text-brand-500 leading-none`}>{'★'.repeat(full)}</span>
      {half === 1 && <span className={`${sizeCls} text-brand-300 leading-none`}>★</span>}
      <span className={`${sizeCls} text-earth-200 leading-none`}>{'★'.repeat(empty)}</span>
      {count !== undefined && (
        <span className="font-body text-xs text-earth-500 ml-1">({count})</span>
      )}
    </div>
  )
}

export default StarRating

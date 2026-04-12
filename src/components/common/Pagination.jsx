const Pagination = ({ page, pages, onPageChange }) => {
  if (!pages || pages <= 1) return null

  const getRange = () => {
    const delta = 2
    const range = []
    for (let i = Math.max(2, page - delta); i <= Math.min(pages - 1, page + delta); i++) {
      range.push(i)
    }
    if (page - delta > 2)       range.unshift('...')
    if (page + delta < pages - 1) range.push('...')
    range.unshift(1)
    if (pages > 1) range.push(pages)
    return range
  }

  const btnBase = 'w-9 h-9 rounded-lg font-body text-sm font-bold transition-all duration-150 flex items-center justify-center'

  return (
    <nav className="flex items-center justify-center gap-1 mt-10">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className={`${btnBase} bg-white border border-earth-200 text-earth-600 hover:bg-earth-50 disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        ‹
      </button>

      {getRange().map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="w-9 h-9 flex items-center justify-center text-earth-400 text-sm">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`${btnBase} ${
              p === page
                ? 'bg-brand-600 text-white border border-brand-600'
                : 'bg-white border border-earth-200 text-earth-700 hover:bg-earth-50'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === pages}
        className={`${btnBase} bg-white border border-earth-200 text-earth-600 hover:bg-earth-50 disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        ›
      </button>
    </nav>
  )
}

export default Pagination

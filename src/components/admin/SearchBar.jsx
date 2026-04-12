import React from 'react'

const SearchBar = ({ searchInput, setSearchInput, handleSearch, setSearch }) => {
  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <div className="relative">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="input-field pl-9 w-52 py-2 text-sm"
          placeholder="Search products…"
        />

        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400 text-sm">
          🔍
        </span>

        {searchInput && (
          <button
            type="button"
            onClick={() => {
              setSearchInput('')
              setSearch('')
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400 hover:text-earth-700 text-xs"
          >
            ✕
          </button>
        )}
      </div>

      <button type="submit" className="btn-secondary text-sm py-2 px-4">
        Search
      </button>
    </form>
  )
}

export default React.memo(SearchBar)
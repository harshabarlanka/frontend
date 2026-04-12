import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProductsAPI } from '../api/product.api'
import ProductGrid from '../components/product/ProductGrid'
import Pagination from '../components/common/Pagination'
import { CATEGORIES, SORT_OPTIONS, PRICE_RANGES } from '../constants'

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const [products, setProducts] = useState([])
  const [meta,     setMeta]     = useState({ total: 0, pages: 1, page: 1 })
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [sideOpen, setSideOpen] = useState(false)

  // Derive filter state from URL params
  const filters = {
    category: searchParams.get('category') || '',
    search:   searchParams.get('search')   || '',
    sort:     searchParams.get('sort')     || '-createdAt',
    featured: searchParams.get('featured') || '',
    priceIdx: Number(searchParams.get('priceIdx') || 0),
    page:     Number(searchParams.get('page') || 1),
  }

  const updateFilter = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      if (key !== 'page') next.set('page', '1')
      return next
    })
  }

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const priceRange = PRICE_RANGES[filters.priceIdx]
      const params = {
        page:     filters.page,
        limit:    12,
        sort:     filters.sort,
        ...(filters.category && { category: filters.category }),
        ...(filters.search   && { search:   filters.search   }),
        ...(filters.featured && { featured: filters.featured }),
        ...(priceRange.min   && { minPrice: priceRange.min   }),
        ...(priceRange.max   && { maxPrice: priceRange.max   }),
      }
      const { data } = await getProductsAPI(params)
      setProducts(data.data?.products ?? [])
      setMeta(data.meta ?? { total: 0, pages: 1, page: 1 })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products.')
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const clearFilters = () => setSearchParams({})

  const hasActiveFilters = filters.category || filters.search || filters.featured || filters.priceIdx > 0

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h4 className="font-display font-bold text-earth-900 text-sm mb-3 uppercase tracking-wide">Category</h4>
        <div className="space-y-1.5">
          <button
            onClick={() => updateFilter('category', '')}
            className={`w-full text-left px-3 py-2 rounded-lg font-body text-sm transition-colors ${!filters.category ? 'bg-brand-600 text-white font-bold' : 'text-earth-700 hover:bg-earth-50'}`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => updateFilter('category', cat.value)}
              className={`w-full text-left px-3 py-2 rounded-lg font-body text-sm transition-colors flex items-center gap-2 ${filters.category === cat.value ? 'bg-brand-600 text-white font-bold' : 'text-earth-700 hover:bg-earth-50'}`}
            >
              <span>{cat.emoji}</span>
              <span className="capitalize">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h4 className="font-display font-bold text-earth-900 text-sm mb-3 uppercase tracking-wide">Price Range</h4>
        <div className="space-y-1.5">
          {PRICE_RANGES.map((range, idx) => (
            <button
              key={idx}
              onClick={() => updateFilter('priceIdx', idx > 0 ? String(idx) : '')}
              className={`w-full text-left px-3 py-2 rounded-lg font-body text-sm transition-colors ${filters.priceIdx === idx ? 'bg-brand-600 text-white font-bold' : 'text-earth-700 hover:bg-earth-50'}`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Featured toggle */}
      <div>
        <h4 className="font-display font-bold text-earth-900 text-sm mb-3 uppercase tracking-wide">Special</h4>
        <button
          onClick={() => updateFilter('featured', filters.featured ? '' : 'true')}
          className={`w-full text-left px-3 py-2 rounded-lg font-body text-sm transition-colors flex items-center gap-2 ${filters.featured ? 'bg-brand-600 text-white font-bold' : 'text-earth-700 hover:bg-earth-50'}`}
        >
          <span>⭐</span> Best Sellers Only
        </button>
      </div>

      {hasActiveFilters && (
        <button onClick={clearFilters} className="btn-ghost w-full text-spice-600 hover:bg-spice-50 text-sm">
          ✕ Clear All Filters
        </button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-earth-50 animate-fade-in">
      <div className="page-container py-8 pt-24">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="section-title">
              {filters.category ? CATEGORIES.find(c => c.value === filters.category)?.label : 'All Products'}
            </h1>
            {!loading && (
              <p className="font-body text-earth-500 text-sm mt-1">
                {meta.total} product{meta.total !== 1 ? 's' : ''} found
                {filters.search && ` for "${filters.search}"`}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile filter button */}
            <button
              onClick={() => setSideOpen(true)}
              className="lg:hidden btn-secondary text-sm gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 12h10m-6 8h2" />
              </svg>
              Filters {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-brand-500" />}
            </button>

            {/* Sort */}
            <div className="relative">
              <select
                value={filters.sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="select-field pr-8 text-sm py-2"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <form
            onSubmit={(e) => { e.preventDefault(); updateFilter('search', e.target.search.value) }}
            className="flex gap-2"
          >
            <input
              name="search"
              defaultValue={filters.search}
              key={filters.search}
              type="text"
              placeholder="Search pickles…"
              className="input-field max-w-sm"
            />
            <button type="submit" className="btn-primary text-sm py-2">Search</button>
            {filters.search && (
              <button type="button" onClick={() => updateFilter('search', '')} className="btn-ghost text-sm">
                Clear
              </button>
            )}
          </form>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-24 card p-5">
              <FilterPanel />
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1 min-w-0">
            <ProductGrid products={products} loading={loading} error={error} />
            <Pagination page={meta.page} pages={meta.pages} onPageChange={(p) => updateFilter('page', String(p))} />
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {sideOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-earth-900/50" onClick={() => setSideOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-xl p-6 overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-earth-900 text-lg">Filters</h3>
              <button onClick={() => setSideOpen(false)} className="p-1 text-earth-500 hover:text-earth-900">✕</button>
            </div>
            <FilterPanel />
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductsPage

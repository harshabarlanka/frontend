import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getProductAPI, addReviewAPI } from '../api/product.api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { PageLoader } from '../components/common/Loader'
import StarRating from '../components/common/StarRating'
import Badge from '../components/common/Badge'
import ErrorState from '../components/common/ErrorState'
import { formatPrice, formatDate, getErrorMessage } from '../utils'
import toast from 'react-hot-toast'

const ProductDetailPage = () => {
  const { slug } = useParams()
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const { addToCart } = useCart()

  const [product,      setProduct]      = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [selectedImg,  setSelectedImg]  = useState(0)
  const [qty,          setQty]          = useState(1)
  const [adding,       setAdding]       = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewText,   setReviewText]   = useState('')
  const [submitting,   setSubmitting]   = useState(false)
  const [activeTab,    setActiveTab]    = useState('description')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const { data } = await getProductAPI(slug)
        setProduct(data.data.product)
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  if (loading) return <PageLoader />
  if (error || !product) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <ErrorState message={error} onRetry={() => window.location.reload()} />
    </div>
  )

  const variant   = product.variants?.[selectedVariant]
  const discount  = variant ? Math.round(((variant.mrp - variant.price) / variant.mrp) * 100) : 0
  const inStock   = variant?.stock > 0

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return }
    try {
      setAdding(true)
      await addToCart(product._id, variant._id, qty)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setAdding(false)
    }
  }

  const handleBuyNow = async () => {
    if (!user) { navigate('/login'); return }
    try {
      setAdding(true)
      await addToCart(product._id, variant._id, qty)
      navigate('/cart')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setAdding(false)
    }
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    if (reviewRating === 0) { toast.error('Please select a rating.'); return }
    try {
      setSubmitting(true)
      await addReviewAPI(product._id, { rating: reviewRating, comment: reviewText })
      toast.success('Review submitted!')
      setReviewRating(0)
      setReviewText('')
      // Refresh product
      const { data } = await getProductAPI(slug)
      setProduct(data.data.product)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const images = product.images?.length > 0 ? product.images : [null]

  return (
    <div className="min-h-screen bg-earth-50 pt-20 animate-fade-in">
      <div className="page-container py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-body text-earth-400 mb-8">
          <Link to="/" className="hover:text-brand-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-brand-600 transition-colors">Shop</Link>
          <span>/</span>
          <Link to={`/products?category=${product.category}`} className="hover:text-brand-600 transition-colors capitalize">{product.category}</Link>
          <span>/</span>
          <span className="text-earth-700 truncate max-w-[160px]">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">

          {/* ── Images ────────────────────────────────────────────────────── */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="aspect-square rounded-2xl overflow-hidden bg-earth-100 border border-earth-100">
              {images[selectedImg] ? (
                <img
                  src={images[selectedImg]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-all duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">🫙</div>
              )}
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImg(idx)}
                    className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${selectedImg === idx ? 'border-brand-500' : 'border-transparent hover:border-earth-300'}`}
                  >
                    {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-earth-100 flex items-center justify-center text-xl">🫙</div>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info ──────────────────────────────────────────────────────── */}
          <div className="space-y-6">
            {/* Title + badges */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="brand" className="capitalize">{product.category}</Badge>
                {product.isFeatured && <Badge variant="warning">⭐ Best Seller</Badge>}
              </div>
              <h1 className="font-display font-bold text-3xl text-earth-900 leading-tight">{product.name}</h1>

              {product.ratings?.count > 0 && (
                <div className="mt-3 flex items-center gap-3">
                  <StarRating rating={product.ratings.average} size="md" />
                  <span className="font-body text-sm text-earth-500">{product.ratings.average} ({product.ratings.count} reviews)</span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-end gap-3">
              <span className="font-display font-black text-4xl text-earth-900">
                {formatPrice(variant?.price ?? 0)}
              </span>
              {discount > 0 && (
                <>
                  <span className="font-body text-lg text-earth-400 line-through">{formatPrice(variant?.mrp ?? 0)}</span>
                  <span className="badge bg-leaf-100 text-leaf-800">{discount}% OFF</span>
                </>
              )}
            </div>

            {/* Variants */}
            {product.variants?.length > 0 && (
              <div>
                <h3 className="font-body font-bold text-earth-700 text-sm mb-2.5 uppercase tracking-wide">
                  Size / Weight
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {product.variants.map((v, idx) => (
                    <button
                      key={v._id}
                      onClick={() => { setSelectedVariant(idx); setQty(1) }}
                      className={`px-4 py-2 rounded-xl border-2 font-body font-bold text-sm transition-all duration-150 ${
                        selectedVariant === idx
                          ? 'border-brand-600 bg-brand-600 text-white'
                          : v.stock === 0
                          ? 'border-earth-100 text-earth-300 line-through cursor-not-allowed bg-earth-50'
                          : 'border-earth-200 text-earth-700 hover:border-brand-400 bg-white'
                      }`}
                      disabled={v.stock === 0}
                    >
                      {v.size}
                      {v.stock === 0 && ' (OOS)'}
                    </button>
                  ))}
                </div>
                {variant && (
                  <p className={`font-body text-xs mt-2 ${variant.stock <= 5 && variant.stock > 0 ? 'text-spice-600 font-bold' : 'text-earth-400'}`}>
                    {variant.stock === 0 ? 'Out of stock' : variant.stock <= 5 ? `Only ${variant.stock} left!` : `${variant.stock} in stock`}
                  </p>
                )}
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="font-body font-bold text-earth-700 text-sm mb-2.5 uppercase tracking-wide">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-earth-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q-1))} disabled={qty <= 1}
                    className="w-11 h-11 flex items-center justify-center text-earth-600 hover:bg-earth-50 transition-colors disabled:opacity-40 font-body font-bold text-lg">−</button>
                  <span className="w-11 h-11 flex items-center justify-center font-body font-bold text-earth-900">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(variant?.stock ?? 20, q+1))} disabled={qty >= (variant?.stock ?? 20)}
                    className="w-11 h-11 flex items-center justify-center text-earth-600 hover:bg-earth-50 transition-colors disabled:opacity-40 font-body font-bold text-lg">+</button>
                </div>
                <span className="font-body text-sm text-earth-500">= {formatPrice((variant?.price ?? 0) * qty)}</span>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={adding || !inStock}
                className="flex-1 btn-secondary py-3.5 text-base font-bold disabled:opacity-50"
              >
                {adding ? 'Adding…' : !inStock ? 'Out of Stock' : '🛒 Add to Cart'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={adding || !inStock}
                className="flex-1 btn-primary py-3.5 text-base font-bold disabled:opacity-50"
              >
                Buy Now →
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: '🚚', text: 'Free shipping over ₹500' },
                { icon: '↩️', text: '7-day easy returns'       },
                { icon: '🌿', text: 'No preservatives'          },
              ].map(({ icon, text }) => (
                <div key={text} className="flex flex-col items-center text-center p-3 bg-earth-50 rounded-xl">
                  <span className="text-xl mb-1">{icon}</span>
                  <span className="font-body text-xs text-earth-600 leading-tight">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs ──────────────────────────────────────────────────────────── */}
        <div className="card">
          <div className="flex border-b border-earth-100 overflow-x-auto scrollbar-hide">
            {[
              { key: 'description', label: 'Description'  },
              { key: 'ingredients', label: 'Ingredients'  },
              { key: 'reviews',     label: `Reviews (${product.reviews?.length ?? 0})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`shrink-0 px-6 py-4 font-body font-bold text-sm border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-brand-600 text-brand-700'
                    : 'border-transparent text-earth-500 hover:text-earth-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8">
            {/* Description */}
            {activeTab === 'description' && (
              <div className="prose prose-earth max-w-none animate-fade-in">
                <p className="font-body text-earth-700 leading-relaxed whitespace-pre-line">{product.description}</p>
                {product.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-6">
                    {product.tags.map((tag) => (
                      <span key={tag} className="badge bg-earth-100 text-earth-600">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Ingredients */}
            {activeTab === 'ingredients' && (
              <div className="animate-fade-in">
                {product.ingredients ? (
                  <p className="font-body text-earth-700 leading-relaxed">{product.ingredients}</p>
                ) : (
                  <p className="font-body text-earth-400 italic">Ingredients not listed. Please contact us for details.</p>
                )}
              </div>
            )}

            {/* Reviews */}
            {activeTab === 'reviews' && (
              <div className="space-y-8 animate-fade-in">
                {/* Review form */}
                {user ? (
                  <div className="card p-6 bg-earth-50">
                    <h3 className="font-display font-bold text-earth-900 text-lg mb-4">Write a Review</h3>
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div>
                        <label className="font-body text-sm font-bold text-earth-700 mb-2 block">Your Rating</label>
                        <StarRating interactive rating={reviewRating} size="lg" onRate={setReviewRating} />
                      </div>
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Tell us about this pickle…"
                        rows={3}
                        className="input-field resize-none"
                      />
                      <button type="submit" disabled={submitting || reviewRating === 0} className="btn-primary text-sm">
                        {submitting ? 'Submitting…' : 'Submit Review'}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-earth-50 rounded-xl">
                    <p className="font-body text-earth-600 mb-3">Sign in to leave a review</p>
                    <Link to="/login" className="btn-primary text-sm">Login</Link>
                  </div>
                )}

                {/* Existing reviews */}
                {product.reviews?.length > 0 ? (
                  <div className="space-y-4">
                    {product.reviews.map((review, idx) => (
                      <div key={idx} className="border-b border-earth-100 pb-5 last:border-0">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center font-body font-bold text-brand-700 text-sm shrink-0">
                            {review.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-body font-bold text-earth-900 text-sm">{review.name}</span>
                              <span className="font-body text-xs text-earth-400">{formatDate(review.createdAt)}</span>
                            </div>
                            <StarRating rating={review.rating} size="sm" className="my-1" />
                            {review.comment && (
                              <p className="font-body text-earth-600 text-sm leading-relaxed mt-1">{review.comment}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-body text-earth-400 text-center py-8">No reviews yet. Be the first!</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage

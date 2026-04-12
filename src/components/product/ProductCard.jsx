import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import StarRating from '../common/StarRating'
import { formatPrice, getErrorMessage } from '../../utils'
import toast from 'react-hot-toast'

const ProductCard = ({ product }) => {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0)

  const variant = product.variants?.[selectedVariantIdx]
  const discount = variant ? Math.round(((variant.mrp - variant.price) / variant.mrp) * 100) : 0

  const handleAddToCart = async (e) => {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    if (!variant) return
    try {
      setAdding(true)
      await addToCart(product._id, variant._id, 1)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setAdding(false)
    }
  }

  return (
    <Link
      to={`/products/${product.slug}`}
      className="card group flex flex-col hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-earth-50 rounded-t-2xl aspect-square">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-7xl">
            🫙
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isFeatured && (
            <span className="badge bg-brand-600 text-white">⭐ Featured</span>
          )}
          {discount > 0 && (
            <span className="badge bg-spice-600 text-white">{discount}% OFF</span>
          )}
        </div>

        {/* Category */}
        <div className="absolute top-3 right-3">
          <span className="badge bg-white/90 text-earth-700 capitalize">
            {product.category}
          </span>
        </div>

        {/* Out of stock overlay */}
        {variant && variant.stock === 0 && (
          <div className="absolute inset-0 bg-earth-900/50 flex items-center justify-center rounded-t-2xl">
            <span className="badge bg-white text-earth-800 text-sm">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex-1">
          <h3 className="font-display font-bold text-earth-900 text-base leading-snug group-hover:text-brand-700 transition-colors line-clamp-2">
            {product.name}
          </h3>

          {product.ratings?.count > 0 && (
            <div className="mt-1.5">
              <StarRating rating={product.ratings.average} count={product.ratings.count} size="sm" />
            </div>
          )}
        </div>

        {/* Variant selector */}
        {product.variants?.length > 1 && (
          <div className="flex flex-wrap gap-1.5" onClick={(e) => e.preventDefault()}>
            {product.variants.map((v, idx) => (
              <button
                key={v._id}
                onClick={(e) => { e.preventDefault(); setSelectedVariantIdx(idx) }}
                className={`px-2 py-0.5 rounded-md font-body text-xs font-bold border transition-all duration-150 ${
                  idx === selectedVariantIdx
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-earth-600 border-earth-200 hover:border-brand-400'
                }`}
              >
                {v.size}
              </button>
            ))}
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="font-display font-bold text-earth-900 text-lg leading-none">
              {formatPrice(variant?.price ?? 0)}
            </span>
            {discount > 0 && (
              <span className="font-body text-xs text-earth-400 line-through ml-1.5">
                {formatPrice(variant?.mrp ?? 0)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={adding || (variant && variant.stock === 0)}
            className="shrink-0 btn-primary text-xs py-2 px-3 rounded-lg"
          >
            {adding ? '…' : variant?.stock === 0 ? 'Sold Out' : '+ Cart'}
          </button>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard

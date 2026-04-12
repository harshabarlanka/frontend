import ProductCard from './ProductCard'
import { SkeletonList } from '../common/Loader'
import EmptyState from '../common/EmptyState'
import { Link } from 'react-router-dom'

const ProductGrid = ({ products, loading, error }) => {
  if (loading) return <SkeletonList count={6} />

  if (error) return (
    <div className="text-center py-16">
      <p className="font-body text-earth-500">{error}</p>
    </div>
  )

  if (!products || products.length === 0) return (
    <EmptyState
      emoji="🫙"
      title="No pickles found"
      message="Try adjusting your filters — our jars are full, just a different flavour!"
      action={
        <Link to="/products" className="btn-primary">
          View All Pickles
        </Link>
      }
    />
  )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  )
}

export default ProductGrid

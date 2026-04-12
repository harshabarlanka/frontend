import { Link } from 'react-router-dom'

const NotFoundPage = () => (
  <div className="min-h-screen bg-earth-50 flex items-center justify-center px-4">
    <div className="text-center max-w-md animate-fade-in">
      <div className="text-8xl mb-6">🫙</div>
      <h1 className="font-display text-6xl font-black text-earth-200 mb-2">404</h1>
      <h2 className="font-display text-2xl font-bold text-earth-900 mb-3">Jar Not Found</h2>
      <p className="font-body text-earth-500 mb-8 text-lg">
        Looks like this pickle jar rolled off the shelf. Let's get you back to the good stuff.
      </p>
      <div className="flex gap-3 justify-center">
        <Link to="/" className="btn-primary">Go Home</Link>
        <Link to="/products" className="btn-secondary">Browse Pickles</Link>
      </div>
    </div>
  </div>
)

export default NotFoundPage

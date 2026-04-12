const ErrorState = ({ message = 'Something went wrong. Please try again.', onRetry, className = '' }) => (
  <div className={`text-center py-16 px-4 ${className}`}>
    <div className="text-5xl mb-4">⚠️</div>
    <h3 className="font-display text-xl text-earth-800 mb-2">Oops!</h3>
    <p className="font-body text-earth-500 mb-6 max-w-sm mx-auto leading-relaxed">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-primary">
        Try Again
      </button>
    )}
  </div>
)

export default ErrorState

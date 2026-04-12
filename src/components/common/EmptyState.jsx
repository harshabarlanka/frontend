const EmptyState = ({ emoji = '🫙', title, message, action, className = '' }) => (
  <div className={`text-center py-20 px-4 ${className}`}>
    <div className="text-6xl mb-4 animate-bounce">{emoji}</div>
    {title && (
      <h3 className="font-display text-2xl text-earth-800 mb-2">{title}</h3>
    )}
    {message && (
      <p className="font-body text-earth-500 max-w-sm mx-auto mb-6 leading-relaxed">
        {message}
      </p>
    )}
    {action}
  </div>
)

export default EmptyState

const variants = {
  default: 'bg-earth-100 text-earth-700',
  brand:   'bg-brand-100 text-brand-800',
  success: 'bg-leaf-100  text-leaf-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger:  'bg-spice-100 text-spice-800',
  info:    'bg-blue-100  text-blue-800',
  purple:  'bg-purple-100 text-purple-800',
}

const Badge = ({ children, variant = 'default', className = '' }) => (
  <span className={`badge ${variants[variant] ?? variants.default} ${className}`}>
    {children}
  </span>
)

export default Badge

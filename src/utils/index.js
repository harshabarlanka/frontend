export const formatPrice = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export const formatDateTime = (dateStr) =>
  new Date(dateStr).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export const getErrorMessage = (err) =>
  err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.'

export const truncate = (str, n = 100) => str?.length > n ? str.slice(0, n) + '…' : str

export const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

export const classNames = (...classes) => classes.filter(Boolean).join(' ')

export const generateStars = (rating) => {
  const full  = Math.floor(rating)
  const half  = rating % 1 >= 0.5 ? 1 : 0
  const empty = 5 - full - half
  return { full, half, empty }
}

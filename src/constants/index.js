export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || ''

export const CATEGORIES = [
  { value: 'veg-pickles', label: 'Veg Pickles', emoji: '🥭' },
  { value: 'non-veg-pickles', label: 'Non-Veg Pickles', emoji: '🍗' },
  { value: 'sweets', label: 'Sweets', emoji: '🍬' },
  { value: 'snacks', label: 'Snacks', emoji: '🍘' },
  { value: 'podis', label: 'Podis', emoji: '🌶️' },
  { value: 'others', label: 'Others', emoji: '🍯' },
]

export const ORDER_STATUSES = {
  pending:   { label: 'Pending',    color: 'bg-yellow-100 text-yellow-800',  step: 0 },
  confirmed: { label: 'Confirmed',  color: 'bg-blue-100 text-blue-800',      step: 1 },
  packed:    { label: 'Packed',     color: 'bg-purple-100 text-purple-800',  step: 2 },
  shipped:   { label: 'Shipped',    color: 'bg-indigo-100 text-indigo-800',  step: 3 },
  delivered: { label: 'Delivered',  color: 'bg-green-100 text-green-800',    step: 4 },
  cancelled: { label: 'Cancelled',  color: 'bg-red-100 text-red-800',        step: -1 },
  refunded:  { label: 'Refunded',   color: 'bg-gray-100 text-gray-700',      step: -1 },
}

export const SORT_OPTIONS = [
  { value: '-createdAt',      label: 'Newest First'     },
  { value: 'createdAt',       label: 'Oldest First'     },
  { value: '-ratings.average',label: 'Top Rated'        },
  { value: 'minPrice',        label: 'Price: Low to High'},
  { value: '-minPrice',       label: 'Price: High to Low'},
]

export const PRICE_RANGES = [
  { label: 'All Prices',   min: '',  max: '' },
  { label: 'Under ₹200',  min: '',  max: '200' },
  { label: '₹200 – ₹400', min: '200', max: '400' },
  { label: '₹400 – ₹600', min: '400', max: '600' },
  { label: 'Above ₹600',  min: '600', max: '' },
]

export const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
]

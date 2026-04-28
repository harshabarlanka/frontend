import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { placeOrderAPI } from '../api/order.api'
import { verifyPaymentAPI } from '../api/payment.api'
import { validateCouponAPI } from '../api/admin/admin.api'
import { addAddressAPI, getAddressesAPI } from '../api/user.api'
import { RAZORPAY_KEY_ID } from '../constants/constants_index'
import { formatPrice, getErrorMessage } from '../utils'
import EmptyState from '../components/common/EmptyState'
import Loader from '../components/common/Loader'
import AddressCard from '../components/address/AddressCard'
import AddressForm from '../components/address/AddressForm'
import toast from 'react-hot-toast'

const STEPS = ['Address', 'Payment', 'Review']
const MAX_ADDRESSES = 5

const toShippingPayload = (addr) => ({
  fullName: addr.fullName,
  phone: addr.phone,
  addressLine1: addr.addressLine1,
  addressLine2: addr.addressLine2 || '',
  city: addr.city,
  state: addr.state,
  pincode: addr.pincode,
  country: addr.country || 'India',
})

const CheckoutPage = () => {
  const { user, updateUser } = useAuth()
  const { cart, cartTotal, clearCart } = useCart()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [placing, setPlacing] = useState(false)

  const [addresses, setAddresses] = useState(user?.addresses || [])
  const [loadingAddresses, setLoadingAddresses] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [savingAddress, setSavingAddress] = useState(false)

  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')

  const [shippingCost, setShippingCost] = useState(null)
  const [shippingLoading, setShippingLoading] = useState(false)

  const items = cart?.items ?? []
  const subtotal = cartTotal
  const discountAmount = appliedCoupon?.discountAmount || 0
  const resolvedShipping = shippingCost !== null ? shippingCost : subtotal >= 999 ? 0 : 60
  const total = Math.max(1, subtotal + resolvedShipping - discountAmount)

  const selectedAddress = addresses.find((a) => a._id === selectedAddressId) || null

  const fetchAddresses = useCallback(async () => {
    setLoadingAddresses(true)
    try {
      const { data } = await getAddressesAPI()
      const fresh = data.data.user.addresses || []
      setAddresses(fresh)
      updateUser({ addresses: fresh })
      const defaultAddr = fresh.find((a) => a.isDefault) || fresh[0]
      if (defaultAddr) setSelectedAddressId(defaultAddr._id)
      if (fresh.length === 0) setShowAddForm(true)
    } catch {
      const fallback = user?.addresses || []
      setAddresses(fallback)
      const defaultAddr = fallback.find((a) => a.isDefault) || fallback[0]
      if (defaultAddr) setSelectedAddressId(defaultAddr._id)
      if (fallback.length === 0) setShowAddForm(true)
    } finally {
      setLoadingAddresses(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchAddresses() }, [fetchAddresses])

  useEffect(() => {
    const pincode = selectedAddress?.pincode
    if (pincode && /^\d{6}$/.test(pincode)) {
      setShippingLoading(true)
      setShippingCost(subtotal >= 999 ? 0 : 60)
      setShippingLoading(false)
    }
  }, [selectedAddress?.pincode, subtotal])

  const handleAddAddress = async (formData) => {
    setSavingAddress(true)
    try {
      const { data } = await addAddressAPI(formData)
      const updatedAddresses = data.data.addresses
      setAddresses(updatedAddresses)
      updateUser({ addresses: updatedAddresses })
      const newAddr = updatedAddresses[updatedAddresses.length - 1]
      if (newAddr) setSelectedAddressId(newAddr._id)
      setShowAddForm(false)
      toast.success('Address added!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSavingAddress(false)
    }
  }

  const handleAddressNext = () => {
    if (!selectedAddressId || !selectedAddress) {
      toast.error('Please select a delivery address')
      return
    }
    setStep(1)
  }

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase()
    if (!code) return
    setCouponError('')
    setCouponLoading(true)
    try {
      const { data } = await validateCouponAPI(code, subtotal)
      const { discountAmount: da, coupon } = data.data
      setAppliedCoupon({ code: coupon.code, discountAmount: da })
      setCouponInput('')
      toast.success(`Coupon "${coupon.code}" applied! You save ${formatPrice(da)}`)
    } catch (err) {
      setCouponError(getErrorMessage(err))
      setAppliedCoupon(null)
    } finally {
      setCouponLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponInput('')
    setCouponError('')
    toast('Coupon removed.', { icon: '✕' })
  }

  const handleRazorpayPayment = (orderData) =>
    new Promise((resolve, reject) => {
      if (!window.Razorpay) {
        reject(new Error('Razorpay SDK not loaded. Please refresh the page.'))
        return
      }
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderData.razorpay.amount,
        currency: orderData.razorpay.currency,
        order_id: orderData.razorpay.orderId,
        name: 'Naidu Gari Ruchulu',
        description: `Order ${orderData.order.orderNumber}`,
        image: '/favicon.svg',
        prefill: { name: user.name, email: user.email, contact: user.phone || '' },
        theme: { color: '#cc6d09' },
        handler: async (response) => {
          try {
            const { data: verifyData } = await verifyPaymentAPI({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })
            resolve(verifyData.data.order)
          } catch (err) {
            reject(err)
          }
        },
        modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
      }
      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (r) => reject(new Error(r.error.description || 'Payment failed')))
      rzp.open()
    })

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('No delivery address selected')
      setStep(0)
      return
    }
    try {
      setPlacing(true)
      const { data } = await placeOrderAPI({
        shippingAddress: toShippingPayload(selectedAddress),
        paymentMethod: 'razorpay',
        couponCode: appliedCoupon?.code || undefined,
      })
      const orderData = data.data
      if (orderData.order?.shippingCost !== undefined) setShippingCost(orderData.order.shippingCost)
      const confirmedOrder = await handleRazorpayPayment(orderData)
      await clearCart()
      toast.success('Order placed successfully! 🎉')
      navigate(`/orders/${confirmedOrder._id}`, { replace: true })
    } catch (err) {
      const msg = getErrorMessage(err)
      if (msg !== 'Payment cancelled') toast.error(msg)
    } finally {
      setPlacing(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-earth-50">
        <EmptyState emoji="🔒" title="Please log in" message="Sign in to complete your purchase."
          action={<Link to="/login" className="btn-primary">Login</Link>} />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-earth-50">
        <EmptyState emoji="🛒" title="Nothing to checkout" message="Add some jars to your cart first!"
          action={<Link to="/products" className="btn-primary">Browse Pickles</Link>} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-earth-50 animate-fade-in">
      <div className="page-container">
        <h1 className="section-title mb-8">Checkout</h1>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-10 max-w-sm">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-body transition-all ${
                i < step ? 'bg-leaf-500 text-white' : i === step ? 'bg-brand-600 text-white' : 'bg-earth-200 text-earth-500'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`font-body text-sm hidden sm:block ${i === step ? 'text-brand-700 font-bold' : 'text-earth-500'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`h-px flex-1 ${i < step ? 'bg-leaf-400' : 'bg-earth-200'}`} />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* STEP 0: Address */}
            {step === 0 && (
              <div className="card p-6 animate-slide-up">
                <h2 className="font-display text-xl font-bold text-earth-900 mb-6">Delivery Address</h2>

                {loadingAddresses ? (
                  <div className="flex items-center justify-center py-10"><Loader /></div>
                ) : (
                  <>
                    {addresses.length > 0 && (
                      <div className="space-y-3 mb-6">
                        <p className="font-body text-sm text-earth-500 font-semibold">Choose a delivery address</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {addresses.map((addr) => (
                            <AddressCard
                              key={addr._id}
                              address={addr}
                              selected={selectedAddressId === addr._id}
                              onSelect={() => setSelectedAddressId(addr._id)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {!showAddForm ? (
                      addresses.length < MAX_ADDRESSES ? (
                        <button
                          onClick={() => setShowAddForm(true)}
                          className="w-full py-3 rounded-xl border-2 border-dashed border-earth-200 text-earth-500 hover:border-brand-400 hover:text-brand-700 hover:bg-brand-50 transition-all font-body text-sm font-bold"
                        >
                          + Add a new address
                        </button>
                      ) : (
                        <p className="font-body text-xs text-earth-400 text-center py-2">
                          You have reached the maximum of 5 saved addresses.
                        </p>
                      )
                    ) : (
                      <div className="mt-4 p-5 rounded-2xl border border-earth-200 bg-earth-50 animate-slide-up">
                        <h3 className="font-display font-bold text-earth-900 mb-4">New Address</h3>
                        <AddressForm
                          onSave={handleAddAddress}
                          onCancel={addresses.length > 0 ? () => setShowAddForm(false) : undefined}
                          saving={savingAddress}
                          submitLabel="Save"
                        />
                      </div>
                    )}

                    {!showAddForm && (
                      <button
                        onClick={handleAddressNext}
                        disabled={!selectedAddressId}
                        className="btn-primary mt-6 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Continue to Payment →
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {/* STEP 1: Payment */}
            {step === 1 && (
              <div className="card p-6 animate-slide-up">
                <h2 className="font-display text-xl font-bold text-earth-900 mb-6">Payment Method</h2>

                <label className="flex items-start gap-4 p-4 rounded-xl border-2 border-brand-500 bg-brand-50 cursor-pointer">
                  <input type="radio" name="payment" value="razorpay" checked readOnly className="mt-1 accent-brand-600" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-body font-bold text-earth-900">Pay Online</span>
                      <span className="badge bg-leaf-100 text-leaf-800 text-xs">Recommended</span>
                    </div>
                    <p className="font-body text-sm text-earth-500">Credit/Debit card, UPI, Net Banking, Wallets via Razorpay</p>
                    <div className="flex gap-2 mt-2">{['💳','📱','🏦'].map((icon, i) => <span key={i} className="text-lg">{icon}</span>)}</div>
                  </div>
                </label>

                <div className="mt-6 pt-6 border-t border-earth-100">
                  <h3 className="font-display text-base font-bold text-earth-900 mb-3">Have a Coupon?</h3>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-leaf-50 border border-leaf-200">
                      <div>
                        <p className="font-body text-sm font-bold text-leaf-800">🎟️ {appliedCoupon.code}</p>
                        <p className="font-body text-xs text-leaf-600 mt-0.5">You save {formatPrice(appliedCoupon.discountAmount)}</p>
                      </div>
                      <button onClick={handleRemoveCoupon} className="font-body text-xs text-spice-600 hover:text-spice-800 font-bold">Remove</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={couponInput}
                        onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError('') }}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                        className="input-field flex-1"
                        placeholder="Enter coupon code"
                        maxLength={20}
                      />
                      <button onClick={handleApplyCoupon} disabled={couponLoading || !couponInput.trim()} className="btn-secondary px-4 whitespace-nowrap disabled:opacity-50">
                        {couponLoading ? <Loader size="sm" /> : 'Apply'}
                      </button>
                    </div>
                  )}
                  {couponError && <p className="font-body text-xs text-spice-600 mt-2">{couponError}</p>}
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(0)} className="btn-secondary">← Back</button>
                  <button onClick={() => setStep(2)} className="btn-primary">Review Order →</button>
                </div>
              </div>
            )}

            {/* STEP 2: Review */}
            {step === 2 && (
              <div className="space-y-4 animate-slide-up">
                <div className="card p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-display font-bold text-earth-900 mb-2">Delivering to</h3>
                      {selectedAddress ? (
                        <>
                          <p className="font-body text-sm text-earth-700 font-bold">{selectedAddress.fullName}</p>
                          <p className="font-body text-sm text-earth-500">{selectedAddress.addressLine1}{selectedAddress.addressLine2 ? `, ${selectedAddress.addressLine2}` : ''}</p>
                          <p className="font-body text-sm text-earth-500">{selectedAddress.city}, {selectedAddress.state} — {selectedAddress.pincode}</p>
                          <p className="font-body text-sm text-earth-400">{selectedAddress.phone}</p>
                        </>
                      ) : (
                        <p className="font-body text-sm text-spice-600">No address selected</p>
                      )}
                    </div>
                    <button onClick={() => setStep(0)} className="font-body text-xs text-brand-600 hover:text-brand-800">Edit</button>
                  </div>
                </div>

                <div className="card p-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-display font-bold text-earth-900 mb-1">Payment</h3>
                      <p className="font-body text-sm text-earth-600">💳 Online Payment (Razorpay)</p>
                      {appliedCoupon && <p className="font-body text-sm text-leaf-700 mt-1">🎟️ {appliedCoupon.code} (−{formatPrice(appliedCoupon.discountAmount)})</p>}
                    </div>
                    <button onClick={() => setStep(1)} className="font-body text-xs text-brand-600 hover:text-brand-800">Edit</button>
                  </div>
                </div>

                <div className="card p-5">
                  <h3 className="font-display font-bold text-earth-900 mb-4">Items ({items.length})</h3>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item._id} className="flex gap-3 items-center">
                        <div className="w-12 h-12 rounded-lg bg-earth-100 flex items-center justify-center text-xl overflow-hidden flex-shrink-0">
                          {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : '🫙'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-sm font-bold text-earth-900 truncate">{item.name}</p>
                          <p className="font-body text-xs text-earth-500">{item.size} × {item.quantity}</p>
                        </div>
                        <p className="font-body text-sm font-bold text-earth-900 flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-secondary">← Back</button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placing || shippingLoading || !selectedAddress}
                    className="btn-primary flex-1 py-3.5 text-base disabled:opacity-60"
                  >
                    {placing ? (
                      <span className="flex items-center justify-center gap-2"><Loader size="sm" /> Opening payment…</span>
                    ) : (
                      '💳 Pay ' + formatPrice(total)
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="font-display font-bold text-earth-900 text-lg mb-4">Price Breakdown</h2>
              <div className="space-y-3 font-body text-sm">
                <div className="flex justify-between text-earth-700">
                  <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-earth-700">
                  <span>Shipping{shippingLoading && <span className="ml-1 text-earth-400 text-xs">(checking…)</span>}</span>
                  <span className={resolvedShipping === 0 ? 'text-leaf-700 font-bold' : ''}>
                    {shippingLoading ? '—' : resolvedShipping === 0 ? 'FREE' : formatPrice(resolvedShipping)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-leaf-700 font-bold">
                    <span>🎟️ Discount</span><span>−{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-earth-100">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-earth-600">Total</span>
                    <span className="text-base font-semibold text-earth-800">₹{total}</span>
                  </div>
                  <p className="text-xs text-earth-400 mt-1">Inclusive of all taxes • No hidden charges</p>
                </div>
              </div>

              {appliedCoupon && (
                <div className="mt-4 p-2 rounded-lg bg-leaf-50 border border-leaf-200">
                  <p className="font-body text-xs text-leaf-700 font-bold">🎟️ {appliedCoupon.code} — saving {formatPrice(discountAmount)}</p>
                </div>
              )}

              <div className="mt-5 pt-5 border-t border-earth-100 space-y-2">
                {['🔒 256-bit SSL encryption', '📦 Packed with care', '↩️ 7-day return policy'].map((t) => (
                  <p key={t} className="font-body text-xs text-earth-500 flex items-center gap-2">{t}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage

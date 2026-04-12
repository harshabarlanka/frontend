import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getCartAPI, addToCartAPI, updateCartItemAPI, removeCartItemAPI, clearCartAPI } from '../api/cart.api'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const { user } = useAuth()
  const [cart, setCart]         = useState({ items: [], subtotal: 0, totalItems: 0 })
  const [cartLoading, setCartLoading] = useState(false)

  // ── Fetch cart whenever user changes ──────────────────────────────────────
  useEffect(() => {
    if (user) fetchCart()
    else setCart({ items: [], subtotal: 0, totalItems: 0 })
  }, [user])

  const fetchCart = useCallback(async () => {
    try {
      setCartLoading(true)
      const { data } = await getCartAPI()
      setCart(data.data.cart)
    } catch {
      // silent — cart fetch failures shouldn't block the app
    } finally {
      setCartLoading(false)
    }
  }, [])

  const addToCart = useCallback(async (productId, variantId, quantity = 1) => {
    const { data } = await addToCartAPI({ productId, variantId, quantity })
    setCart(data.data.cart)
    toast.success('Added to cart!')
    return data.data.cart
  }, [])

  const updateQuantity = useCallback(async (itemId, quantity) => {
    const { data } = await updateCartItemAPI(itemId, quantity)
    setCart(data.data.cart)
  }, [])

  const removeItem = useCallback(async (itemId) => {
    const { data } = await removeCartItemAPI(itemId)
    setCart(data.data.cart)
    toast.success('Item removed')
  }, [])

  const clearCart = useCallback(async () => {
    await clearCartAPI()
    setCart({ items: [], subtotal: 0, totalItems: 0 })
  }, [])

  const cartCount  = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0
  const cartTotal  = cart?.items?.reduce((sum, i) => sum + i.price * i.quantity, 0) ?? 0

  return (
    <CartContext.Provider value={{
      cart, cartLoading, cartCount, cartTotal,
      fetchCart, addToCart, updateQuantity, removeItem, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

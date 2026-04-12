import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../utils'
import Loader from '../components/common/Loader'
import toast from 'react-hot-toast'

const LoginPage = () => {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (mode === 'register' && !form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required'
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (mode === 'register' && form.phone && !/^[6-9]\d{9}$/.test(form.phone))
      errs.phone = 'Enter a valid 10-digit mobile number'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    try {
      setLoading(true)
      if (mode === 'login') {
        await login({ email: form.email, password: form.password })
        toast.success('Welcome back! 🫙')
      } else {
        await register({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone || undefined,
        })
        toast.success('Account created! Welcome aboard 🎉')
      }
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-earth-50 flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-800 via-earth-800 to-spice-900 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-texture opacity-20" />
        <div className="relative text-center px-12">
          <div className="text-8xl mb-6">🫙</div>
          <h1 className="font-display text-4xl font-bold text-brand-100 leading-tight mb-4">
            Handcrafted with love, <em>bottled with tradition</em>
          </h1>
          <p className="font-body text-earth-300 text-lg leading-relaxed">
            Authentic Indian pickles made from age-old family recipes. No preservatives, no compromises.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { emoji: '🌶️', label: '12+ Varieties' },
              { emoji: '🏡', label: 'Home Made' },
              { emoji: '🚚', label: 'Pan India' },
            ].map(({ emoji, label }) => (
              <div key={label} className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="text-3xl mb-1">{emoji}</div>
                <p className="font-body text-xs font-bold text-brand-200">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-10 group">
            <span className="text-4xl group-hover:scale-110 transition-transform">🫙</span>
            <span className="font-display text-2xl font-bold text-earth-900">Naidu Gari Ruchulu</span>
          </Link>

          {/* Mode toggle */}
          <div className="flex bg-earth-100 rounded-xl p-1 mb-8">
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setErrors({}) }}
                className={`flex-1 py-2.5 rounded-lg font-body font-bold text-sm capitalize transition-all ${
                  mode === m
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-earth-500 hover:text-earth-700'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <h2 className="font-display text-3xl font-bold text-earth-900 mb-2">
            {mode === 'login' ? 'Welcome back!' : 'Join the family'}
          </h2>
          <p className="font-body text-earth-500 mb-8">
            {mode === 'login'
              ? 'Sign in to your Naidu Gari Ruchulu account'
              : 'Create your account and start ordering'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block font-body text-sm font-bold text-earth-700 mb-1.5">Full Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Priya Sharma"
                  autoComplete="name"
                />
                {errors.name && <p className="text-spice-600 text-xs mt-1 font-body">{errors.name}</p>}
              </div>
            )}

            <div>
              <label className="block font-body text-sm font-bold text-earth-700 mb-1.5">Email Address</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="input-field"
                placeholder="priya@example.com"
                autoComplete="email"
              />
              {errors.email && <p className="text-spice-600 text-xs mt-1 font-body">{errors.email}</p>}
            </div>

            {mode === 'register' && (
              <div>
                <label className="block font-body text-sm font-bold text-earth-700 mb-1.5">
                  Mobile Number <span className="text-earth-400 font-normal">(optional)</span>
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="9876543210"
                  maxLength={10}
                />
                {errors.phone && <p className="text-spice-600 text-xs mt-1 font-body">{errors.phone}</p>}
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="font-body text-sm font-bold text-earth-700">Password</label>
                {mode === 'login' && (
                  <Link to="/forgot-password" className="font-body text-xs text-brand-600 hover:text-brand-800">
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400 hover:text-earth-700 transition-colors"
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <p className="text-spice-600 text-xs mt-1 font-body">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader size="sm" />
                  {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                </span>
              ) : (
                mode === 'login' ? 'Sign In →' : 'Create Account →'
              )}
            </button>
          </form>

          <p className="font-body text-sm text-center text-earth-500 mt-6">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErrors({}) }}
              className="text-brand-600 font-bold hover:text-brand-800"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          <div className="mt-8 pt-6 border-t border-earth-200">
            <p className="font-body text-xs text-center text-earth-400">
              By continuing, you agree to our{' '}
              <span className="text-brand-600 cursor-pointer hover:underline">Terms of Service</span>
              {' '}and{' '}
              <span className="text-brand-600 cursor-pointer hover:underline">Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

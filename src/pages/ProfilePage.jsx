import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateProfileAPI, changePasswordAPI, addAddressAPI, deleteAddressAPI } from '../api/user.api'
import { INDIAN_STATES } from '../constants'
import { getErrorMessage } from '../utils'
import Loader from '../components/common/Loader'
import toast from 'react-hot-toast'

const tabs = ['Profile', 'Addresses', 'Security']

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('Profile')

  if (!user) return null

  return (
    <div className="min-h-screen bg-earth-50 pt-20 animate-fade-in">
      <div className="page-container py-8">
        {/* Header */}
        <div className="flex items-center gap-5 mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-400 to-earth-600 flex items-center justify-center text-3xl text-white font-display font-bold shadow-md">
            {user.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-earth-900">{user.name}</h1>
            <p className="font-body text-earth-500 text-sm">{user.email}</p>
            {user.role === 'admin' && (
              <span className="badge bg-brand-100 text-brand-800 mt-1">Admin</span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-earth-100 p-1 rounded-xl mb-8 max-w-sm">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg font-body font-bold text-sm transition-all ${
                activeTab === tab ? 'bg-white text-brand-700 shadow-sm' : 'text-earth-500 hover:text-earth-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="max-w-2xl">
          {activeTab === 'Profile' && <ProfileTab user={user} updateUser={updateUser} />}
          {activeTab === 'Addresses' && <AddressesTab user={user} updateUser={updateUser} />}
          {activeTab === 'Security' && <SecurityTab logout={logout} />}
        </div>
      </div>
    </div>
  )
}

// ── Profile tab ──────────────────────────────────────────────────────────────
const ProfileTab = ({ user, updateUser }) => {
  const [form, setForm] = useState({ name: user.name || '', phone: user.phone || '' })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters'
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) errs.phone = 'Enter a valid mobile number'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    try {
      setSaving(true)
      const { data } = await updateProfileAPI(form)
      updateUser(data.data.user)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card p-6 space-y-5">
      <h2 className="font-display text-xl font-bold text-earth-900">Personal Info</h2>
      <div>
        <label className="block font-body text-sm font-bold text-earth-700 mb-1.5">Full Name</label>
        <input
          value={form.name}
          onChange={(e) => { setForm((p) => ({ ...p, name: e.target.value })); setErrors((p) => ({ ...p, name: '' })) }}
          className="input-field"
          placeholder="Your name"
        />
        {errors.name && <p className="text-spice-600 text-xs mt-1 font-body">{errors.name}</p>}
      </div>
      <div>
        <label className="block font-body text-sm font-bold text-earth-700 mb-1.5">Email Address</label>
        <input value={user.email} disabled className="input-field opacity-60 cursor-not-allowed" />
        <p className="font-body text-xs text-earth-400 mt-1">Email cannot be changed</p>
      </div>
      <div>
        <label className="block font-body text-sm font-bold text-earth-700 mb-1.5">Mobile Number</label>
        <input
          value={form.phone}
          onChange={(e) => { setForm((p) => ({ ...p, phone: e.target.value })); setErrors((p) => ({ ...p, phone: '' })) }}
          className="input-field"
          placeholder="9876543210"
          maxLength={10}
        />
        {errors.phone && <p className="text-spice-600 text-xs mt-1 font-body">{errors.phone}</p>}
      </div>
      <button onClick={handleSave} disabled={saving} className="btn-primary">
        {saving ? <><Loader size="sm" /> Saving…</> : 'Save Changes'}
      </button>
    </div>
  )
}

// ── Addresses tab ─────────────────────────────────────────────────────────────
const AddressesTab = ({ user, updateUser }) => {
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [blank] = useState({ label: 'Home', fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', isDefault: false })
  const [form, setForm] = useState(blank)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!form.fullName.trim()) errs.fullName = 'Required'
    if (!/^[6-9]\d{9}$/.test(form.phone)) errs.phone = 'Invalid mobile'
    if (!form.addressLine1.trim()) errs.addressLine1 = 'Required'
    if (!form.city.trim()) errs.city = 'Required'
    if (!form.state) errs.state = 'Required'
    if (!/^\d{6}$/.test(form.pincode)) errs.pincode = 'Invalid pincode'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleAdd = async () => {
    if (!validate()) return
    try {
      setSaving(true)
      const { data } = await addAddressAPI(form)
      updateUser({ addresses: data.data.addresses })
      setShowForm(false)
      setForm(blank)
      toast.success('Address added!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this address?')) return
    try {
      const { data } = await deleteAddressAPI(id)
      updateUser({ addresses: data.data.addresses })
      toast.success('Address deleted')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const ch = (e) => { const { name, value } = e.target; setForm((p) => ({ ...p, [name]: value })); setErrors((p) => ({ ...p, [name]: '' })) }

  return (
    <div className="space-y-4">
      {user.addresses?.map((addr) => (
        <div key={addr._id} className="card p-5">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-body font-bold text-earth-900 text-sm">{addr.label || 'Saved'}</span>
                {addr.isDefault && <span className="badge bg-brand-100 text-brand-800">Default</span>}
              </div>
              <p className="font-body text-sm text-earth-700 font-bold">{addr.fullName}</p>
              <p className="font-body text-sm text-earth-500">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}</p>
              <p className="font-body text-sm text-earth-500">{addr.city}, {addr.state} — {addr.pincode}</p>
              <p className="font-body text-sm text-earth-400">{addr.phone}</p>
            </div>
            <button onClick={() => handleDelete(addr._id)} className="text-spice-500 hover:text-spice-700 text-sm font-body font-bold">Delete</button>
          </div>
        </div>
      ))}

      {user.addresses?.length < 5 && !showForm && (
        <button onClick={() => setShowForm(true)} className="btn-secondary w-full">+ Add New Address</button>
      )}

      {showForm && (
        <div className="card p-6 animate-slide-up">
          <h3 className="font-display font-bold text-earth-900 mb-4">New Address</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Label</label>
              <input name="label" value={form.label} onChange={ch} className="input-field" placeholder="Home, Work…" />
            </div>
            <div>
              <label className="block font-body text-sm font-bold text-earth-700 mb-1">Full Name *</label>
              <input name="fullName" value={form.fullName} onChange={ch} className="input-field" />
              {errors.fullName && <p className="text-spice-600 text-xs mt-1">{errors.fullName}</p>}
            </div>
            <div>
              <label className="block font-body text-sm font-bold text-earth-700 mb-1">Phone *</label>
              <input name="phone" value={form.phone} onChange={ch} className="input-field" maxLength={10} />
              {errors.phone && <p className="text-spice-600 text-xs mt-1">{errors.phone}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="block font-body text-sm font-bold text-earth-700 mb-1">Address Line 1 *</label>
              <input name="addressLine1" value={form.addressLine1} onChange={ch} className="input-field" />
              {errors.addressLine1 && <p className="text-spice-600 text-xs mt-1">{errors.addressLine1}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="block font-body text-sm font-bold text-earth-700 mb-1">Address Line 2</label>
              <input name="addressLine2" value={form.addressLine2} onChange={ch} className="input-field" />
            </div>
            <div>
              <label className="block font-body text-sm font-bold text-earth-700 mb-1">City *</label>
              <input name="city" value={form.city} onChange={ch} className="input-field" />
              {errors.city && <p className="text-spice-600 text-xs mt-1">{errors.city}</p>}
            </div>
            <div>
              <label className="block font-body text-sm font-bold text-earth-700 mb-1">Pincode *</label>
              <input name="pincode" value={form.pincode} onChange={ch} className="input-field" maxLength={6} />
              {errors.pincode && <p className="text-spice-600 text-xs mt-1">{errors.pincode}</p>}
            </div>
            <div>
              <label className="block font-body text-sm font-bold text-earth-700 mb-1">State *</label>
              <div className="relative">
                <select name="state" value={form.state} onChange={ch} className="select-field">
                  <option value="">Select</option>
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-earth-400">▾</span>
              </div>
              {errors.state && <p className="text-spice-600 text-xs mt-1">{errors.state}</p>}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input type="checkbox" id="isDefault" checked={form.isDefault} onChange={(e) => setForm((p) => ({ ...p, isDefault: e.target.checked }))} className="accent-brand-600" />
              <label htmlFor="isDefault" className="font-body text-sm text-earth-700">Set as default</label>
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={() => { setShowForm(false); setForm(blank) }} className="btn-secondary">Cancel</button>
            <button onClick={handleAdd} disabled={saving} className="btn-primary">
              {saving ? <><Loader size="sm" /> Saving…</> : 'Save Address'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Security tab ─────────────────────────────────────────────────────────────
const SecurityTab = ({ logout }) => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!form.currentPassword) errs.currentPassword = 'Required'
    if (form.newPassword.length < 8) errs.newPassword = 'Min 8 characters'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleChange = async () => {
    if (!validate()) return
    try {
      setSaving(true)
      await changePasswordAPI(form)
      toast.success('Password changed! Please log in again.')
      setTimeout(() => logout(), 1500)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const ch = (e) => { const { name, value } = e.target; setForm((p) => ({ ...p, [name]: value })); setErrors((p) => ({ ...p, [name]: '' })) }

  return (
    <div className="card p-6 space-y-5">
      <h2 className="font-display text-xl font-bold text-earth-900">Change Password</h2>
      <div>
        <label className="block font-body text-sm font-bold text-earth-700 mb-1.5">Current Password</label>
        <input name="currentPassword" type="password" value={form.currentPassword} onChange={ch} className="input-field" placeholder="••••••••" />
        {errors.currentPassword && <p className="text-spice-600 text-xs mt-1">{errors.currentPassword}</p>}
      </div>
      <div>
        <label className="block font-body text-sm font-bold text-earth-700 mb-1.5">New Password</label>
        <input name="newPassword" type="password" value={form.newPassword} onChange={ch} className="input-field" placeholder="Min 8 characters" />
        {errors.newPassword && <p className="text-spice-600 text-xs mt-1">{errors.newPassword}</p>}
      </div>
      <button onClick={handleChange} disabled={saving} className="btn-primary">
        {saving ? <><Loader size="sm" /> Changing…</> : 'Update Password'}
      </button>
    </div>
  )
}

export default ProfilePage

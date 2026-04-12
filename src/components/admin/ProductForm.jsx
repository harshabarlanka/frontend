import { useState, useEffect, useRef } from 'react'
import { createProductAPI, updateProductAPI } from '../../api/admin/admin.api'
import { uploadImagesAPI } from '../../api/admin/upload.api'
import { CATEGORIES } from '../../constants'
import { getErrorMessage } from '../../utils'
import Loader from '../common/Loader'
import toast from 'react-hot-toast'

const MAX_IMAGES = 5

const EMPTY_VARIANT = () => ({ _id: crypto.randomUUID(), size: '', price: '', mrp: '', stock: '', sku: '' })

const EMPTY_FORM = {
  name:        '',
  description: '',
  ingredients: '',
  category:    'veg-pickles',
  images:      [],   // array of Cloudinary URLs
  tags:        '',
  weight:      '500',
  taxRate:     '12',
  hsn:         '2001',
  isFeatured:  false,
  isActive:    true,
  variants:    [EMPTY_VARIANT()],
}

const toForm = (product) => ({
  name:        product.name        || '',
  description: product.description || '',
  ingredients: product.ingredients || '',
  category:    product.category    || 'veg-pickles',
  images:      product.images      || [],           // already URLs from DB
  tags:        (product.tags || []).join(', '),
  weight:      String(product.weight  ?? 500),
  taxRate:     String(product.taxRate ?? 12),
  hsn:         product.hsn         || '2001',
  isFeatured:  !!product.isFeatured,
  isActive:    product.isActive !== false,
  variants:    product.variants?.length
    ? product.variants.map((v) => ({
        _id:   v._id || crypto.randomUUID(),
        size:  v.size  || '',
        price: String(v.price ?? ''),
        mrp:   String(v.mrp   ?? ''),
        stock: String(v.stock ?? ''),
        sku:   v.sku   || '',
      }))
    : [EMPTY_VARIANT()],
})

const toPayload = (form) => ({
  name:        form.name.trim(),
  description: form.description.trim(),
  ingredients: form.ingredients.trim() || undefined,
  category:    form.category,
  images:      form.images,          // already an array of URLs
  tags:        form.tags.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean),
  weight:      Number(form.weight)  || 500,
  taxRate:     Number(form.taxRate) || 12,
  hsn:         form.hsn.trim() || '2001',
  isFeatured:  form.isFeatured,
  isActive:    form.isActive,
  variants:    form.variants.map((v) => ({
    size:  v.size.trim(),
    price: Number(v.price),
    mrp:   Number(v.mrp),
    stock: Number(v.stock),
    sku:   v.sku.trim() || undefined,
  })),
})

// Defined outside ProductForm to prevent remount / focus-loss on render.
const Field = ({ label, name, required, errors, children }) => (
  <div>
    <label className="block font-body text-sm font-bold text-earth-700 mb-1">
      {label} {required && <span className="text-spice-500">*</span>}
    </label>
    {children}
    {errors[name] && (
      <p className="font-body text-xs text-spice-600 mt-1">{errors[name]}</p>
    )}
  </div>
)

const ProductForm = ({ product = null, onClose, onSaved }) => {
  const isEdit = !!product
  const [form, setForm]           = useState(isEdit ? toForm(product) : EMPTY_FORM)
  const [saving, setSaving]       = useState(false)
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors]       = useState({})
  const fileInputRef              = useRef(null)

  useEffect(() => {
    setForm(isEdit ? toForm(product) : EMPTY_FORM)
    setErrors({})
  }, [product])

  // ── Field helpers ─────────────────────────────────────────────────────────
  const set = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }))
    setErrors((p) => ({ ...p, [field]: '' }))
  }

  const setVariant = (i, field, value) => {
    setForm((p) => {
      const variants = [...p.variants]
      variants[i] = { ...variants[i], [field]: value }
      return { ...p, variants }
    })
    setErrors((p) => ({ ...p, [`variant_${i}_${field}`]: '' }))
  }

  const addVariant    = () => setForm((p) => ({ ...p, variants: [...p.variants, EMPTY_VARIANT()] }))
  const removeVariant = (i) => setForm((p) => ({ ...p, variants: p.variants.filter((_, idx) => idx !== i) }))

  // ── Image upload ──────────────────────────────────────────────────────────
  const handleImageSelect = async (e) => {
    const selected = Array.from(e.target.files || [])
    if (!selected.length) return

    const remaining = MAX_IMAGES - form.images.length
    if (remaining <= 0) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`)
      return
    }

    const toUpload = selected.slice(0, remaining)
    if (toUpload.length < selected.length) {
      toast(`Only ${remaining} more image(s) can be added`, { icon: '⚠️' })
    }

    try {
      setUploading(true)
      setErrors((p) => ({ ...p, images: '' }))
      const urls = await uploadImagesAPI(toUpload)
      setForm((p) => ({ ...p, images: [...p.images, ...urls] }))
      toast.success(`${urls.length} image${urls.length > 1 ? 's' : ''} uploaded`)
    } catch (err) {
      toast.error(`Upload failed: ${getErrorMessage(err)}`)
      setErrors((p) => ({ ...p, images: 'Image upload failed. Please try again.' }))
    } finally {
      setUploading(false)
      // Reset file input so the same file can be re-selected after removal
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeImage = (index) => {
    setForm((p) => ({ ...p, images: p.images.filter((_, i) => i !== index) }))
  }

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {}
    if (!form.name.trim())        errs.name        = 'Name is required'
    if (!form.description.trim()) errs.description = 'Description is required'
    if (!form.category)           errs.category    = 'Category is required'
    if (form.variants.length === 0) errs.variants  = 'At least one variant is required'

    form.variants.forEach((v, i) => {
      if (!v.size.trim())      errs[`variant_${i}_size`]  = 'Size required'
      if (!v.price || Number(v.price) <= 0) errs[`variant_${i}_price`] = 'Valid price required'
      if (!v.mrp   || Number(v.mrp)   <= 0) errs[`variant_${i}_mrp`]   = 'Valid MRP required'
      if (v.stock === '' || Number(v.stock) < 0) errs[`variant_${i}_stock`] = 'Stock required'
    })

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) {
      toast.error('Please fix the errors below')
      return
    }
    try {
      setSaving(true)
      const payload = toPayload(form)
      let saved
      if (isEdit) {
        const { data } = await updateProductAPI(product._id, payload)
        saved = data.data.product
        toast.success('Product updated!')
      } else {
        const { data } = await createProductAPI(payload)
        saved = data.data.product
        toast.success('Product created!')
      }
      onSaved(saved)
      onClose()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-earth-950/60 overflow-y-auto py-8 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-earth-100">
          <h2 className="font-display text-xl font-bold text-earth-900">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="text-earth-400 hover:text-earth-700 transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* ── Basic info ─────────────────────────────────────────────── */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Product Name" name="name" required errors={errors}>
                <input
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  className="input-field"
                  placeholder="Mango Pickle (Aam ka Achar)"
                />
              </Field>
            </div>

            <Field label="Category" name="category" required errors={errors}>
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) => set('category', e.target.value)}
                  className="select-field"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
                  ))}
                </select>
              </div>
            </Field>

            <Field label="Weight (g)" name="weight" errors={errors}>
              <input
                type="number"
                value={form.weight}
                onChange={(e) => set('weight', e.target.value)}
                className="input-field"
                min={1}
              />
            </Field>

            <div className="sm:col-span-2">
              <Field label="Description" name="description" required errors={errors}>
                <textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  className="input-field min-h-[80px] resize-y"
                  placeholder="Describe your pickle…"
                />
              </Field>
            </div>

            <div className="sm:col-span-2">
              <Field label="Ingredients" name="ingredients" errors={errors}>
                <textarea
                  value={form.ingredients}
                  onChange={(e) => set('ingredients', e.target.value)}
                  className="input-field min-h-[60px] resize-y"
                  placeholder="Mango, salt, chilli…"
                />
              </Field>
            </div>

            {/* ── Image Upload ─────────────────────────────────────────── */}
            <div className="sm:col-span-2">
              <label className="block font-body text-sm font-bold text-earth-700 mb-1">
                Product Images{' '}
                <span className="font-normal text-earth-400">(max {MAX_IMAGES})</span>
              </label>

              {/* File picker */}
              {form.images.length < MAX_IMAGES && (
                <label
                  className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed
                    rounded-xl p-5 cursor-pointer transition-colors
                    ${uploading
                      ? 'border-brand-300 bg-brand-50 cursor-not-allowed'
                      : 'border-earth-300 hover:border-brand-400 hover:bg-earth-50'}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploading}
                    onChange={handleImageSelect}
                    className="sr-only"
                  />
                  {uploading ? (
                    <span className="flex items-center gap-2 text-brand-600 font-body text-sm">
                      <Loader size="sm" /> Uploading…
                    </span>
                  ) : (
                    <>
                      <span className="text-2xl">🖼️</span>
                      <span className="font-body text-sm text-earth-500 text-center">
                        Click to select images &mdash; JPG, PNG, WebP · max 5 MB each
                        <br />
                        <span className="text-earth-400 text-xs">
                          {MAX_IMAGES - form.images.length} slot(s) remaining
                        </span>
                      </span>
                    </>
                  )}
                </label>
              )}

              {errors.images && (
                <p className="font-body text-xs text-spice-600 mt-1">{errors.images}</p>
              )}

              {/* Preview grid */}
              {form.images.length > 0 && (
                <div className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {form.images.map((url, i) => (
                    <div key={url} className="relative group aspect-square">
                      <img
                        src={url}
                        alt={`Product image ${i + 1}`}
                        className="w-full h-full object-cover rounded-lg border border-earth-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center
                                   rounded-full bg-spice-500 text-white text-xs opacity-0
                                   group-hover:opacity-100 transition-opacity leading-none"
                        title="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* ── /Image Upload ─────────────────────────────────────────── */}

            <Field label="Tags (comma-separated)" name="tags" errors={errors}>
              <input
                value={form.tags}
                onChange={(e) => set('tags', e.target.value)}
                className="input-field"
                placeholder="spicy, traditional, bestseller"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="GST (%)" name="taxRate" errors={errors}>
                <input
                  type="number"
                  value={form.taxRate}
                  onChange={(e) => set('taxRate', e.target.value)}
                  className="input-field"
                  min={0} max={100}
                />
              </Field>
              <Field label="HSN Code" name="hsn" errors={errors}>
                <input
                  value={form.hsn}
                  onChange={(e) => set('hsn', e.target.value)}
                  className="input-field"
                  placeholder="2001"
                />
              </Field>
            </div>

            {/* Toggles */}
            <div className="sm:col-span-2 flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => set('isFeatured', e.target.checked)}
                  className="w-4 h-4 accent-brand-600"
                />
                <span className="font-body text-sm text-earth-700 font-bold">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => set('isActive', e.target.checked)}
                  className="w-4 h-4 accent-brand-600"
                />
                <span className="font-body text-sm text-earth-700 font-bold">Active</span>
              </label>
            </div>
          </div>

          {/* ── Variants ───────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-base font-bold text-earth-900">
                Variants <span className="text-spice-500">*</span>
              </h3>
              <button
                type="button"
                onClick={addVariant}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                + Add Variant
              </button>
            </div>

            {errors.variants && (
              <p className="font-body text-xs text-spice-600 mb-2">{errors.variants}</p>
            )}

            <div className="space-y-3">
              {form.variants.map((v, i) => (
                <div
                  key={v._id}
                  className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-earth-50
                             rounded-xl border border-earth-200 relative"
                >
                  <div>
                    <label className="block font-body text-xs font-bold text-earth-600 mb-1">
                      Size <span className="text-spice-500">*</span>
                    </label>
                    <input
                      value={v.size}
                      onChange={(e) => setVariant(i, 'size', e.target.value)}
                      className="input-field text-sm py-2"
                      placeholder="250g"
                    />
                    {errors[`variant_${i}_size`] && (
                      <p className="text-spice-500 text-xs mt-0.5">{errors[`variant_${i}_size`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-body text-xs font-bold text-earth-600 mb-1">
                      Price (₹) <span className="text-spice-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={v.price}
                      onChange={(e) => setVariant(i, 'price', e.target.value)}
                      className="input-field text-sm py-2"
                      placeholder="199"
                      min={0}
                    />
                    {errors[`variant_${i}_price`] && (
                      <p className="text-spice-500 text-xs mt-0.5">{errors[`variant_${i}_price`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-body text-xs font-bold text-earth-600 mb-1">
                      MRP (₹) <span className="text-spice-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={v.mrp}
                      onChange={(e) => setVariant(i, 'mrp', e.target.value)}
                      className="input-field text-sm py-2"
                      placeholder="249"
                      min={0}
                    />
                    {errors[`variant_${i}_mrp`] && (
                      <p className="text-spice-500 text-xs mt-0.5">{errors[`variant_${i}_mrp`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-body text-xs font-bold text-earth-600 mb-1">
                      Stock <span className="text-spice-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={v.stock}
                      onChange={(e) => setVariant(i, 'stock', e.target.value)}
                      className="input-field text-sm py-2"
                      placeholder="50"
                      min={0}
                    />
                    {errors[`variant_${i}_stock`] && (
                      <p className="text-spice-500 text-xs mt-0.5">{errors[`variant_${i}_stock`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-body text-xs font-bold text-earth-600 mb-1">SKU</label>
                    <div className="flex gap-1.5">
                      <input
                        value={v.sku}
                        onChange={(e) => setVariant(i, 'sku', e.target.value)}
                        className="input-field text-sm py-2 flex-1 min-w-0"
                        placeholder="MNG-250"
                      />
                      {form.variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(i)}
                          className="flex-shrink-0 w-8 h-9 flex items-center justify-center
                                     rounded-lg bg-spice-50 text-spice-500 hover:bg-spice-100
                                     transition-colors text-sm font-bold"
                          title="Remove variant"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Footer ─────────────────────────────────────────────────── */}
          <div className="flex gap-3 justify-end pt-2 border-t border-earth-100">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="btn-primary min-w-[120px]"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <Loader size="sm" />
                  {isEdit ? 'Saving…' : 'Creating…'}
                </span>
              ) : (
                isEdit ? 'Save Changes' : 'Create Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductForm

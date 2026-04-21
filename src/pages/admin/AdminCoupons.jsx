import { useState, useEffect } from "react";
import {
  getAdminCouponsAPI,
  createCouponAPI,
  updateCouponAPI,
  deleteCouponAPI,
} from "../../api/admin/admin.api";
import { formatPrice, getErrorMessage } from "../../utils";
import { PageLoader } from "../../components/common/Loader";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";

const EMPTY_FORM = {
  code: "",
  discountType: "percentage",
  value: "",
  minOrderAmount: "",
  maxDiscount: "",
  expiryDate: "",
  usageLimit: "",
  active: true,
};

const toForm = (coupon) => ({
  code: coupon.code || "",
  discountType: coupon.discountType || "percentage",
  value: String(coupon.value ?? ""),
  minOrderAmount: String(coupon.minOrderAmount ?? ""),
  maxDiscount: coupon.maxDiscount != null ? String(coupon.maxDiscount) : "",
  expiryDate: coupon.expiryDate
    ? new Date(coupon.expiryDate).toISOString().split("T")[0]
    : "",
  usageLimit: coupon.usageLimit != null ? String(coupon.usageLimit) : "",
  active: coupon.active !== false,
});

const toPayload = (form) => ({
  code: form.code.trim().toUpperCase(),
  discountType: form.discountType,
  value: Number(form.value),
  minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
  maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
  expiryDate: form.expiryDate,
  usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
  active: form.active,
});

const CouponModal = ({ coupon, onClose, onSaved }) => {
  const isEdit = !!coupon;
  const [form, setForm] = useState(isEdit ? toForm(coupon) : EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.code.trim()) errs.code = "Code is required";
    if (!form.value || isNaN(Number(form.value)) || Number(form.value) <= 0)
      errs.value = "Enter a valid positive value";
    if (form.discountType === "percentage" && Number(form.value) > 100)
      errs.value = "Percentage cannot exceed 100";
    if (!form.expiryDate) errs.expiryDate = "Expiry date is required";
    if (form.minOrderAmount && isNaN(Number(form.minOrderAmount)))
      errs.minOrderAmount = "Enter a valid amount";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      if (isEdit) {
        await updateCouponAPI(coupon._id, toPayload(form));
        toast.success("Coupon updated.");
      } else {
        await createCouponAPI(toPayload(form));
        toast.success("Coupon created.");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-earth-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-display text-lg font-bold text-earth-900">
            {isEdit ? "Edit Coupon" : "Create Coupon"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-earth-100 text-earth-500 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block font-body text-sm font-bold text-earth-700 mb-1">
              Coupon Code *
            </label>
            <input
              value={form.code}
              onChange={(e) => set("code", e.target.value.toUpperCase())}
              className="input-field"
              placeholder="PICKLE20"
              maxLength={20}
              disabled={isEdit && coupon.usageCount > 0}
            />
            {errors.code && (
              <p className="font-body text-xs text-spice-600 mt-1">{errors.code}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-body text-sm font-bold text-earth-700 mb-1">
                Discount Type *
              </label>
              <select
                value={form.discountType}
                onChange={(e) => set("discountType", e.target.value)}
                className="select-field"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>
            </div>

            <div>
              <label className="block font-body text-sm font-bold text-earth-700 mb-1">
                Value *{" "}
                <span className="font-normal text-earth-400">
                  ({form.discountType === "percentage" ? "%" : "₹"})
                </span>
              </label>
              <input
                type="number"
                value={form.value}
                onChange={(e) => set("value", e.target.value)}
                className="input-field"
                placeholder={form.discountType === "percentage" ? "20" : "50"}
                min={0}
                max={form.discountType === "percentage" ? 100 : undefined}
              />
              {errors.value && (
                <p className="font-body text-xs text-spice-600 mt-1">{errors.value}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-body text-sm font-bold text-earth-700 mb-1">
                Min Order Amount (₹)
              </label>
              <input
                type="number"
                value={form.minOrderAmount}
                onChange={(e) => set("minOrderAmount", e.target.value)}
                className="input-field"
                placeholder="0"
                min={0}
              />
              {errors.minOrderAmount && (
                <p className="font-body text-xs text-spice-600 mt-1">
                  {errors.minOrderAmount}
                </p>
              )}
            </div>

            {form.discountType === "percentage" && (
              <div>
                <label className="block font-body text-sm font-bold text-earth-700 mb-1">
                  Max Discount (₹){" "}
                  <span className="font-normal text-earth-400">(optional)</span>
                </label>
                <input
                  type="number"
                  value={form.maxDiscount}
                  onChange={(e) => set("maxDiscount", e.target.value)}
                  className="input-field"
                  placeholder="200"
                  min={0}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-body text-sm font-bold text-earth-700 mb-1">
                Expiry Date *
              </label>
              <input
                type="date"
                value={form.expiryDate}
                onChange={(e) => set("expiryDate", e.target.value)}
                className="input-field"
                min={new Date().toISOString().split("T")[0]}
              />
              {errors.expiryDate && (
                <p className="font-body text-xs text-spice-600 mt-1">{errors.expiryDate}</p>
              )}
            </div>

            <div>
              <label className="block font-body text-sm font-bold text-earth-700 mb-1">
                Usage Limit{" "}
                <span className="font-normal text-earth-400">(blank = unlimited)</span>
              </label>
              <input
                type="number"
                value={form.usageLimit}
                onChange={(e) => set("usageLimit", e.target.value)}
                className="input-field"
                placeholder="100"
                min={1}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => set("active", e.target.checked)}
                className="w-4 h-4 accent-brand-600"
              />
              <span className="font-body text-sm font-bold text-earth-700">
                Active
              </span>
            </label>
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-earth-100">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary min-w-[120px]"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <Loader size="sm" />
                  {isEdit ? "Saving…" : "Creating…"}
                </span>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Create Coupon"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await getAdminCouponsAPI();
      setCoupons(data.data.coupons);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleDelete = async (coupon) => {
    if (
      !window.confirm(
        `Delete coupon "${coupon.code}"? This action cannot be undone.`
      )
    )
      return;
    setDeleting(coupon._id);
    try {
      await deleteCouponAPI(coupon._id);
      toast.success(`Coupon "${coupon.code}" deleted.`);
      fetchCoupons();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      await updateCouponAPI(coupon._id, { active: !coupon.active });
      toast.success(
        `Coupon "${coupon.code}" ${coupon.active ? "deactivated" : "activated"}.`
      );
      fetchCoupons();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (coupon) => {
    setEditing(coupon);
    setModalOpen(true);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-earth-900">
            Coupons
          </h1>
          <p className="font-body text-sm text-earth-500 mt-1">
            {coupons.length} coupon{coupons.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          + New Coupon
        </button>
      </div>

      {coupons.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">🎟️</p>
          <p className="font-display font-bold text-earth-900 text-lg">
            No coupons yet
          </p>
          <p className="font-body text-earth-500 text-sm mt-1">
            Create your first coupon to offer discounts.
          </p>
          <button onClick={openCreate} className="btn-primary mt-4">
            Create Coupon
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-earth-100 shadow-sm">
          <table className="w-full text-sm font-body">
            <thead className="bg-earth-50 border-b border-earth-100">
              <tr>
                {[
                  "Code",
                  "Type",
                  "Value",
                  "Min Order",
                  "Usage",
                  "Expiry",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 font-bold text-earth-700 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-earth-50">
              {coupons.map((coupon) => {
                const isExpired = new Date(coupon.expiryDate) < new Date();
                const isFull =
                  coupon.usageLimit !== null &&
                  coupon.usageCount >= coupon.usageLimit;

                return (
                  <tr key={coupon._id} className="hover:bg-earth-50 transition-colors">
                    <td className="px-4 py-3">
                      <code className="bg-earth-100 px-2 py-0.5 rounded font-mono font-bold text-earth-900">
                        {coupon.code}
                      </code>
                    </td>
                    <td className="px-4 py-3 capitalize text-earth-700">
                      {coupon.discountType}
                    </td>
                    <td className="px-4 py-3 font-bold text-earth-900">
                      {coupon.discountType === "percentage"
                        ? `${coupon.value}%`
                        : formatPrice(coupon.value)}
                      {coupon.maxDiscount &&
                        coupon.discountType === "percentage" && (
                          <span className="text-earth-400 font-normal text-xs ml-1">
                            (max {formatPrice(coupon.maxDiscount)})
                          </span>
                        )}
                    </td>
                    <td className="px-4 py-3 text-earth-600">
                      {coupon.minOrderAmount
                        ? formatPrice(coupon.minOrderAmount)
                        : "None"}
                    </td>
                    <td className="px-4 py-3 text-earth-600">
                      {coupon.usageCount}
                      {coupon.usageLimit !== null
                        ? ` / ${coupon.usageLimit}`
                        : " / ∞"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`${
                          isExpired ? "text-spice-600 font-bold" : "text-earth-600"
                        }`}
                      >
                        {new Date(coupon.expiryDate).toLocaleDateString("en-IN")}
                        {isExpired && " (Expired)"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isExpired || isFull ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-earth-100 text-earth-500">
                          {isExpired ? "Expired" : "Exhausted"}
                        </span>
                      ) : coupon.active ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-leaf-100 text-leaf-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-earth-100 text-earth-500">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(coupon)}
                          className="text-brand-600 hover:text-brand-800 text-xs font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleActive(coupon)}
                          className="text-earth-500 hover:text-earth-700 text-xs"
                        >
                          {coupon.active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDelete(coupon)}
                          disabled={deleting === coupon._id}
                          className="text-spice-500 hover:text-spice-700 text-xs font-bold disabled:opacity-50"
                        >
                          {deleting === coupon._id ? "…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <CouponModal
          coupon={editing}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSaved={fetchCoupons}
        />
      )}
    </div>
  );
};

export default AdminCoupons;

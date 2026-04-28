/**
 * AddressForm — reusable form for adding OR editing a saved address.
 *
 * Props:
 *   initial       – pre-filled address object (for edit mode)
 *   onSave        – async (formData) => void  — called when form is submitted
 *   onCancel      – () => void
 *   saving        – boolean: disable submit while API call is in progress
 *   showDefault   – boolean: show "Set as default" checkbox (default true)
 *   submitLabel   – string: button label (default 'Save Address')
 */
import { useState } from "react";
import { INDIAN_STATES } from "../../constants/constants_index";
import Loader from "../common/Loader";

const BLANK = {
  label: "Home",
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: false,
};

const AddressForm = ({
  initial = BLANK,
  onSave,
  onCancel,
  saving = false,
  showDefault = true,
  submitLabel = "Save Address",
}) => {
  const [form, setForm] = useState({ ...BLANK, ...initial });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Required";
    if (!/^[6-9]\d{9}$/.test(form.phone))
      errs.phone = "Enter a valid 10-digit mobile";
    if (!form.addressLine1.trim()) errs.addressLine1 = "Required";
    if (!form.city.trim()) errs.city = "Required";
    if (!form.state) errs.state = "Required";
    if (!/^\d{6}$/.test(form.pincode))
      errs.pincode = "Enter a valid 6-digit pincode";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave(form);
  };

  const Field = ({ label, name, required, children, colSpan }) => (
    <div className={colSpan === 2 ? "sm:col-span-2" : ""}>
      <label className="block font-body text-sm font-bold text-earth-700 mb-1">
        {label}
        {required && <span className="text-spice-500 ml-0.5">*</span>}
      </label>
      {children}
      {errors[name] && (
        <p className="text-spice-600 text-xs mt-1 font-body">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {/* Label */}
      <div className="sm:col-span-2">
        <label className="block font-body text-sm font-bold text-earth-700 mb-1">
          Address Label
        </label>
        <input
          name="label"
          value={form.label}
          onChange={handleChange}
          className="input-field"
          placeholder="Home, Work, Other…"
        />
      </div>

      {/* Full Name */}
      <Field label="Full Name" name="fullName" required>
        <input
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          className="input-field"
          placeholder="Priya Sharma"
        />
      </Field>

      {/* Phone */}
      <Field label="Mobile Number" name="phone" required>
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className="input-field"
          placeholder="9876543210"
          maxLength={10}
        />
      </Field>

      {/* Address Line 1 */}
      <Field label="Address Line 1" name="addressLine1" required colSpan={2}>
        <input
          name="addressLine1"
          value={form.addressLine1}
          onChange={handleChange}
          className="input-field"
          placeholder="House no., Street, Locality"
        />
      </Field>

      {/* Address Line 2 */}
      <div className="sm:col-span-2">
        <label className="block font-body text-sm font-bold text-earth-700 mb-1">
          Address Line 2{" "}
          <span className="text-earth-400 font-normal">(optional)</span>
        </label>
        <input
          name="addressLine2"
          value={form.addressLine2}
          onChange={handleChange}
          className="input-field"
          placeholder="Apartment, Floor, Landmark"
        />
      </div>

      {/* City */}
      <Field label="City" name="city" required>
        <input
          name="city"
          value={form.city}
          onChange={handleChange}
          className="input-field"
          placeholder="Bengaluru"
        />
      </Field>

      {/* Pincode */}
      <Field label="Pincode" name="pincode" required>
        <input
          name="pincode"
          value={form.pincode}
          onChange={handleChange}
          className="input-field"
          placeholder="560001"
          maxLength={6}
        />
      </Field>

      {/* State */}
      <Field label="State" name="state" required>
        <div className="relative">
          <select
            name="state"
            value={form.state}
            onChange={handleChange}
            className="select-field"
          >
            <option value="">Select state</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-earth-400">
            ▾
          </span>
        </div>
      </Field>

      {/* Set as default */}
      {showDefault && (
        <div className="sm:col-span-2 flex items-center gap-2 mt-1">
          <input
            type="checkbox"
            id="isDefault"
            name="isDefault"
            checked={form.isDefault}
            onChange={handleChange}
            className="accent-brand-600 w-4 h-4"
          />
          <label
            htmlFor="isDefault"
            className="font-body text-sm text-earth-700 cursor-pointer select-none"
          >
            Set as default delivery address
          </label>
        </div>
      )}

      {/* Actions */}
      <div className="sm:col-span-2 flex gap-3 mt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={saving}
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="btn-primary disabled:opacity-60"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <Loader size="sm" /> Saving…
            </span>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </div>
  );
};

export default AddressForm;

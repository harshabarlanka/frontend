import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  updateProfileAPI,
  changePasswordAPI,
  addAddressAPI,
  updateAddressAPI,
  deleteAddressAPI,
} from "../api/user.api";
import { getErrorMessage } from "../utils";
import AddressCard from "../components/address/AddressCard";
import AddressForm from "../components/address/AddressForm";
import Loader from "../components/common/Loader";
import toast from "react-hot-toast";

const tabs = ["Profile", "Addresses", "Security"];

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const [searchParams] = useSearchParams();
  // Support deep-linking: /profile?tab=Addresses
  const tabParam = searchParams.get("tab");
  const initialTab = tabs.includes(tabParam) ? tabParam : "Profile";
  const [activeTab, setActiveTab] = useState(initialTab);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-earth-50 animate-fade-in">
      <div className="page-container">
        {/* Header */}
        <div className="flex items-center gap-5 mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-400 to-earth-600 flex items-center justify-center text-3xl text-white font-display font-bold shadow-md">
            {user.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-earth-900">
              {user.name}
            </h1>
            <p className="font-body text-earth-500 text-sm">{user.email}</p>
            {user.role === "admin" && (
              <span className="badge bg-brand-100 text-brand-800 mt-1">
                Admin
              </span>
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
                activeTab === tab
                  ? "bg-white text-brand-700 shadow-sm"
                  : "text-earth-500 hover:text-earth-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="max-w-2xl">
          {activeTab === "Profile" && (
            <ProfileTab user={user} updateUser={updateUser} />
          )}
          {activeTab === "Addresses" && (
            <AddressesTab user={user} updateUser={updateUser} />
          )}
          {activeTab === "Security" && <SecurityTab logout={logout} />}
        </div>
      </div>
    </div>
  );
};

// ── Profile tab ───────────────────────────────────────────────────────────────
const ProfileTab = ({ user, updateUser }) => {
  const [form, setForm] = useState({
    name: user.name || "",
    phone: user.phone || "",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      errs.name = "Name must be at least 2 characters";
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone))
      errs.phone = "Enter a valid mobile number";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      setSaving(true);
      const { data } = await updateProfileAPI(form);
      updateUser(data.data.user);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-6 space-y-5">
      <h2 className="font-display text-xl font-bold text-earth-900">
        Personal Info
      </h2>
      <div>
        <label className="block font-body text-sm font-bold text-earth-700 mb-1.5">
          Full Name
        </label>
        <input
          value={form.name}
          onChange={(e) => {
            setForm((p) => ({ ...p, name: e.target.value }));
            setErrors((p) => ({ ...p, name: "" }));
          }}
          className="input-field"
          placeholder="Your name"
        />
        {errors.name && (
          <p className="text-spice-600 text-xs mt-1 font-body">{errors.name}</p>
        )}
      </div>
      <div>
        <label className="block font-body text-sm font-bold text-earth-700 mb-1.5">
          Email Address
        </label>
        <input
          value={user.email}
          disabled
          className="input-field opacity-60 cursor-not-allowed"
        />
        <p className="font-body text-xs text-earth-400 mt-1">
          Email cannot be changed
        </p>
      </div>
      <div>
        <label className="block font-body text-sm font-bold text-earth-700 mb-1.5">
          Mobile Number
        </label>
        <input
          value={form.phone}
          onChange={(e) => {
            setForm((p) => ({ ...p, phone: e.target.value }));
            setErrors((p) => ({ ...p, phone: "" }));
          }}
          className="input-field"
          placeholder="9876543210"
          maxLength={10}
        />
        {errors.phone && (
          <p className="text-spice-600 text-xs mt-1 font-body">
            {errors.phone}
          </p>
        )}
      </div>
      <button onClick={handleSave} disabled={saving} className="btn-primary">
        {saving ? (
          <>
            <Loader size="sm" /> Saving…
          </>
        ) : (
          "Save Changes"
        )}
      </button>
    </div>
  );
};

// ── Addresses tab ─────────────────────────────────────────────────────────────
const AddressesTab = ({ user, updateUser }) => {
  const [showForm, setShowForm] = useState(false); // add form
  const [editingId, setEditingId] = useState(null); // id of address being edited
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const addresses = user.addresses || [];

  const handleAdd = async (formData) => {
    try {
      setSaving(true);
      const { data } = await addAddressAPI(formData);
      updateUser({ addresses: data.data.addresses });
      setShowForm(false);
      toast.success("Address added!");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (formData) => {
    try {
      setSaving(true);
      const { data } = await updateAddressAPI(editingId, formData);
      updateUser({ addresses: data.data.addresses });
      setEditingId(null);
      toast.success("Address updated!");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const addr = addresses.find((a) => a._id === id);
      if (!addr) return;
      const { data } = await updateAddressAPI(id, { ...addr, isDefault: true });
      updateUser({ addresses: data.data.addresses });
      toast.success("Default address updated!");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      setDeletingId(id);
      const { data } = await deleteAddressAPI(id);
      updateUser({ addresses: data.data.addresses });
      toast.success("Address deleted");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {addresses.map((addr) =>
        editingId === addr._id ? (
          <div key={addr._id} className="card p-6 animate-slide-up">
            <h3 className="font-display font-bold text-earth-900 mb-4">
              Edit Address
            </h3>
            <AddressForm
              initial={addr}
              onSave={handleEdit}
              onCancel={() => setEditingId(null)}
              saving={saving}
              submitLabel="Update Address"
            />
          </div>
        ) : (
          <AddressCard
            key={addr._id}
            address={addr}
            onEdit={() => {
              setEditingId(addr._id);
              setShowForm(false);
            }}
            onDelete={() => handleDelete(addr._id)}
            onSetDefault={() => handleSetDefault(addr._id)}
            deleting={deletingId === addr._id}
          />
        ),
      )}

      {addresses.length < 5 && !showForm && !editingId && (
        <button
          onClick={() => setShowForm(true)}
          className="btn-secondary w-full"
        >
          New Address
        </button>
      )}

      {showForm && (
        <div className="card p-6 animate-slide-up">
          <h3 className="font-display font-bold text-earth-900 mb-4">
            New Address
          </h3>
          <AddressForm
            onSave={handleAdd}
            onCancel={() => setShowForm(false)}
            saving={saving}
          />
        </div>
      )}

      {addresses.length === 0 && !showForm && (
        <p className="font-body text-sm text-earth-400 text-center py-4">
          No saved addresses yet.
        </p>
      )}
    </div>
  );
};

// ── Security tab ──────────────────────────────────────────────────────────────
const SecurityTab = ({ logout }) => {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "" });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.currentPassword) errs.currentPassword = "Required";
    if (form.newPassword.length < 8) errs.newPassword = "Min 8 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = async () => {
    if (!validate()) return;
    try {
      setSaving(true);
      await changePasswordAPI(form);
      toast.success("Password changed! Please log in again.");
      setTimeout(() => logout(), 1500);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const ch = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  return (
    <div className="card p-6 space-y-5">
      <h2 className="font-display text-xl font-bold text-earth-900">
        Change Password
      </h2>
      <div>
        <label className="block font-body text-sm font-bold text-earth-700 mb-1.5">
          Current Password
        </label>
        <input
          name="currentPassword"
          type="password"
          value={form.currentPassword}
          onChange={ch}
          className="input-field"
          placeholder="••••••••"
        />
        {errors.currentPassword && (
          <p className="text-spice-600 text-xs mt-1">
            {errors.currentPassword}
          </p>
        )}
      </div>
      <div>
        <label className="block font-body text-sm font-bold text-earth-700 mb-1.5">
          New Password
        </label>
        <input
          name="newPassword"
          type="password"
          value={form.newPassword}
          onChange={ch}
          className="input-field"
          placeholder="Min 8 characters"
        />
        {errors.newPassword && (
          <p className="text-spice-600 text-xs mt-1">{errors.newPassword}</p>
        )}
      </div>
      <button onClick={handleChange} disabled={saving} className="btn-primary">
        {saving ? (
          <>
            <Loader size="sm" /> Changing…
          </>
        ) : (
          "Update Password"
        )}
      </button>
    </div>
  );
};

export default ProfilePage;

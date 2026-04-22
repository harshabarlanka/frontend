import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { resetPassAPI } from "../api/auth.api";
import toast from "react-hot-toast";
import { getErrorMessage } from "../utils";

const ResetPassword = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = params.get("token");

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  // 🚨 Handle invalid/missing token
  useEffect(() => {
    if (!token) {
      toast.error("Invalid or expired reset link");
      navigate("/forgot-password");
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.password) return "Password is required";
    if (form.password.length < 8)
      return "Password must be at least 8 characters";
    if (!form.confirmPassword) return "Please confirm your password";
    if (form.password !== form.confirmPassword) return "Passwords do not match";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) return;

    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    try {
      setLoading(true);

      await resetPassAPI({
        token,
        password: form.password,
      });

      toast.success("Password reset successful 🎉");

      // ✅ Redirect with message
      setTimeout(() => {
        navigate("/login", {
          state: { message: "Password reset successful. Please login." },
        });
      }, 1200);
    } catch (err) {
      toast.error(getErrorMessage(err) || "Reset failed or link expired");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-earth-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm"
      >
        <h2 className="text-xl font-bold mb-4 text-center">Reset Password</h2>

        <input
          type="password"
          name="password"
          placeholder="New password"
          className="input-field mb-3"
          value={form.password}
          onChange={handleChange}
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm password"
          className="input-field mb-4"
          value={form.confirmPassword}
          onChange={handleChange}
        />

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;

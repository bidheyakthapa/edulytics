import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import AuthShell from "../components/AuthShell.jsx";
import { useAuthStore } from "../store/authStore.js";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const fetchMe = useAuthStore((s) => s.fetchMe);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const onChange = (e) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        "/api/auth/login",
        { email: form.email, password: form.password },
        { withCredentials: true },
      );

      toast.success("Logged in!");
      const user = res.data;

      await fetchMe();
      navigate(user.role === "TEACHER" ? "/teacher" : "/student");
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Login failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Login to continue to your dashboard."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-slate-600">Email</label>
          <input
            name="email"
            value={form.email}
            onChange={onChange}
            type="email"
            required
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none
                       focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="text-sm text-slate-600">Password</label>
          <input
            name="password"
            value={form.password}
            onChange={onChange}
            type="password"
            required
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none
                       focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
            placeholder="••••••••"
          />
        </div>

        <button
          disabled={loading}
          className="w-full rounded-xl bg-primary-600 text-white py-2
                     hover:bg-primary-700 disabled:opacity-60 transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-sm text-slate-600 text-center">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-primary-600 hover:text-primary-700 font-medium underline"
          >
            Sign up
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

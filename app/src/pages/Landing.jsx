import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";

export default function Landing() {
  const { user, loading } = useAuthStore();
  const navigate = useNavigate();

  // Auto-redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate(user.role === "TEACHER" ? "/teacher" : "/student", {
        replace: true,
      });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 grid place-items-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-5 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary-700">Edulytics</h1>
          <div className="text-sm text-slate-500">
            learning analytics & smart grouping
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h2 className="text-4xl font-bold text-slate-800">
          Learn smarter. Group better.
        </h2>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          Edulytics helps students track topic mastery and enables teachers to
          create balanced project groups using learning analytics.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-xl
                       bg-primary-600 px-6 py-3 text-white font-medium
                       hover:bg-primary-700 transition"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="inline-flex items-center justify-center rounded-xl
                       border border-primary-600 px-6 py-3 text-primary-600
                       font-medium hover:bg-primary-50 transition"
          >
            Sign up
          </Link>
        </div>
      </main>
    </div>
  );
}

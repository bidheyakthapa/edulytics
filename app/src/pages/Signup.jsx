import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import AuthShell from "../components/AuthShell.jsx";
import { useSignupStore } from "../store/signupStore.js";

function Slider({ label, value, onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-sm text-slate-600">{label}</label>
        <span className="text-sm font-semibold text-slate-800">{value}</span>
      </div>
      <input
        type="range"
        min="0"
        max="5"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-primary-600"
      />
      <div className="flex justify-between text-xs text-slate-400">
        <span>0</span>
        <span>5</span>
      </div>
    </div>
  );
}

export default function Signup() {
  const navigate = useNavigate();
  const { step, form, setField, next, prev, reset } = useSignupStore();
  const [loading, setLoading] = useState(false);

  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);

  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingSemesters, setLoadingSemesters] = useState(false);

  const isStudent = form.role === "STUDENT";

  const canGoStep2 = useMemo(() => {
    return form.name.trim() && form.email.trim() && form.password.length >= 6;
  }, [form.name, form.email, form.password]);

  const canSubmit = useMemo(() => {
    if (!canGoStep2) return false;
    if (!isStudent) return true;

    return (
      String(form.course_id).trim() !== "" &&
      String(form.semester_id).trim() !== "" &&
      form.frontend_level >= 0 &&
      form.backend_level >= 0
    );
  }, [
    canGoStep2,
    isStudent,
    form.course_id,
    form.semester_id,
    form.frontend_level,
    form.backend_level,
  ]);

  useEffect(() => {
    reset();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCourses(true);
      try {
        const res = await axios.get("/api/academics/courses");
        setCourses(res.data);
      } catch (err) {
        toast.error(err?.response?.data?.message);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const courseId = form.course_id;
    if (!courseId) {
      setSemesters([]);
      setField("semester_id", "");
      return;
    }

    const fetchSemesters = async () => {
      setLoadingSemesters(true);
      try {
        const res = await axios.get("/api/academics/semesters", {
          params: { courseId },
        });
        setSemesters(res.data);
        setField("semester_id", "");
      } catch (err) {
        toast.error(err?.response?.data?.message);
        setSemesters([]);
        setField("semester_id", "");
      } finally {
        setLoadingSemesters(false);
      }
    };

    fetchSemesters();
  }, [form.course_id]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    try {
      const payload = {
        role: form.role,
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      };

      if (isStudent) {
        payload.semester_id = Number(form.semester_id);
        payload.frontend_level = form.frontend_level;
        payload.backend_level = form.backend_level;
        payload.mobile_level = form.mobile_level;
        payload.uiux_level = form.uiux_level;
      }

      await axios.post("/api/auth/register", payload, {
        withCredentials: true,
      });

      toast.success("Account created! Please login.");
      reset();
      navigate("/login");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        (Array.isArray(err?.response?.data?.errors)
          ? err.response.data.errors[0]
          : "Signup failed. Please try again.");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join Edulytics in minutes."
    >
      <form onSubmit={onSubmit} className="space-y-5">
        {/* Step indicator */}
        <div className="flex items-center justify-between text-sm">
          <div className="text-slate-600">
            Step <span className="font-semibold text-primary-700">{step}</span>{" "}
            of{" "}
            <span className="font-semibold text-primary-700">
              {isStudent ? 2 : 1}
            </span>
          </div>

          {step === 2 ? (
            <button
              type="button"
              onClick={prev}
              className="text-primary-600 hover:text-primary-700 underline font-medium"
            >
              Back
            </button>
          ) : null}
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-600">Role</label>
              <select
                value={form.role}
                onChange={(e) => setField("role", e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 bg-white outline-none
                           focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
              >
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-600">Name</label>
              <input
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                type="text"
                required
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none
                           focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="text-sm text-slate-600">Email</label>
              <input
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
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
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
                type="password"
                required
                minLength={6}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none
                           focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
                placeholder="min 6 characters"
              />
            </div>

            {!isStudent ? (
              <button
                disabled={!canSubmit || loading}
                className="w-full rounded-xl bg-primary-600 text-white py-2
                           hover:bg-primary-700 disabled:opacity-60 transition"
              >
                {loading ? "Creating..." : "Create account"}
              </button>
            ) : (
              <button
                type="button"
                disabled={!canGoStep2}
                onClick={() => next()}
                className="w-full rounded-xl bg-primary-600 text-white py-2
                           hover:bg-primary-700 disabled:opacity-60 transition"
              >
                Continue
              </button>
            )}
          </div>
        )}

        {/* STEP 2 (Student only) */}
        {step === 2 && isStudent && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm text-slate-600">Course</label>
                <select
                  value={form.course_id}
                  onChange={(e) => setField("course_id", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 bg-white outline-none
                             focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
                  disabled={loadingCourses}
                >
                  <option value="">
                    {loadingCourses ? "Loading courses..." : "Select a course"}
                  </option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-600">Semester</label>
                <select
                  value={form.semester_id}
                  onChange={(e) => setField("semester_id", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 bg-white outline-none
                             focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
                  disabled={!form.course_id || loadingSemesters}
                >
                  <option value="">
                    {!form.course_id
                      ? "Select course first"
                      : loadingSemesters
                        ? "Loading semesters..."
                        : "Select a semester"}
                  </option>
                  {semesters.map((s) => (
                    <option key={s.id} value={s.id}>
                      Semester {s.semester_no}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">Skills</p>
                  <p className="text-xs text-slate-500">
                    Rate yourself from 0–5. Used for group balancing.
                  </p>
                </div>
                <span className="text-xs rounded-full bg-primary-100 text-primary-700 px-3 py-1">
                  profile
                </span>
              </div>

              <Slider
                label="Frontend"
                value={form.frontend_level}
                onChange={(v) => setField("frontend_level", v)}
              />
              <Slider
                label="Backend"
                value={form.backend_level}
                onChange={(v) => setField("backend_level", v)}
              />
              <Slider
                label="Mobile"
                value={form.mobile_level}
                onChange={(v) => setField("mobile_level", v)}
              />
              <Slider
                label="UI/UX"
                value={form.uiux_level}
                onChange={(v) => setField("uiux_level", v)}
              />
            </div>

            <button
              disabled={!canSubmit || loading}
              className="w-full rounded-xl bg-primary-600 text-white py-2
                         hover:bg-primary-700 disabled:opacity-60 transition"
            >
              {loading ? "Creating..." : "Create account"}
            </button>
          </div>
        )}

        <p className="text-sm text-slate-600 text-center">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary-600 hover:text-primary-700 font-medium underline"
          >
            Login
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

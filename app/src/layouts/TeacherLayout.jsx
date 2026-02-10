import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { FiMenu, FiLogOut } from "react-icons/fi";
import {
  MdDashboard,
  MdOutlineQuiz,
  MdGroups,
  MdAnalytics,
  MdTopic,
} from "react-icons/md";

import SidebarLink from "../components/SidebarLink.jsx";
import { useTeacherContextStore } from "../store/teacherContextStore.js";
import { useAuthStore } from "../store/authStore.js";

export default function TeacherLayout() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { user, clear } = useAuthStore();
  const { courseId, semesterId, setCourseId, setSemesterId } =
    useTeacherContextStore();

  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingSemesters, setLoadingSemesters] = useState(false);

  // load courses once
  useEffect(() => {
    const loadCourses = async () => {
      setLoadingCourses(true);
      try {
        const res = await axios.get("/api/academics/courses");
        setCourses(res.data);
      } catch {
        toast.error("Failed to load courses");
      } finally {
        setLoadingCourses(false);
      }
    };
    loadCourses();
  }, []);

  // load semesters when course changes
  useEffect(() => {
    const loadSemesters = async () => {
      if (!courseId) {
        setSemesters([]);
        return;
      }
      setLoadingSemesters(true);
      try {
        const res = await axios.get("/api/academics/semesters", {
          params: { courseId },
        });
        setSemesters(res.data);
      } catch {
        toast.error("Failed to load semesters");
        setSemesters([]);
      } finally {
        setLoadingSemesters(false);
      }
    };
    loadSemesters();
  }, [courseId]);

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
    } catch {
      // even if logout call fails, clear client state
    } finally {
      clear();
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Topbar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-100 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="md:hidden p-2 rounded-xl hover:bg-slate-100 cursor-pointer"
              aria-label="Open menu"
            >
              <FiMenu className="text-xl text-slate-700" />
            </button>

            <div className="leading-tight">
              <div className="font-bold text-primary-700 text-lg">
                Edulytics
              </div>
              <div className="text-xs text-slate-500">Teacher workspace</div>
            </div>
          </div>

          {/* Filters + logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="hidden sm:block w-40 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm
                         outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 cursor-pointer"
              disabled={loadingCourses}
            >
              <option value="">
                {loadingCourses ? "Loading..." : "Course"}
              </option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}
                </option>
              ))}
            </select>

            <select
              value={semesterId}
              onChange={(e) => setSemesterId(e.target.value)}
              className="hidden sm:block w-40 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm
                         outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 cursor-pointer"
              disabled={!courseId || loadingSemesters}
            >
              <option value="">
                {!courseId
                  ? "Semester"
                  : loadingSemesters
                    ? "Loading..."
                    : "Semester"}
              </option>
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  Sem {s.semester_no}
                </option>
              ))}
            </select>

            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-3 py-2 text-white text-sm
                         hover:bg-primary-700 transition cursor-pointer"
            >
              <FiLogOut />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile filters */}
        <div className="sm:hidden border-t border-slate-100 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-3 grid grid-cols-2 gap-2">
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm
                         outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 cursor-pointer"
              disabled={loadingCourses}
            >
              <option value="">
                {loadingCourses ? "Loading..." : "Course"}
              </option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}
                </option>
              ))}
            </select>

            <select
              value={semesterId}
              onChange={(e) => setSemesterId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm
                         outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 cursor-pointer"
              disabled={!courseId || loadingSemesters}
            >
              <option value="">
                {!courseId
                  ? "Semester"
                  : loadingSemesters
                    ? "Loading..."
                    : "Semester"}
              </option>
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  Sem {s.semester_no}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Layout grid */}
      <div className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        {/* Sidebar desktop */}
        <aside className="hidden md:block">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3">
            <div className="px-3 py-2 text-xs text-slate-500">
              Signed in as{" "}
              <span className="font-medium text-slate-700">{user?.role}</span>
            </div>

            <nav className="mt-2 space-y-1 h-[80vh]">
              <SidebarLink
                to="/teacher"
                label="Dashboard"
                icon={<MdDashboard />}
                end
              />
              <SidebarLink
                to="/teacher/topics"
                label="Topics"
                icon={<MdTopic />}
              />
              <SidebarLink
                to="/teacher/quizzes"
                label="Quizzes"
                icon={<MdOutlineQuiz />}
              />
              <SidebarLink
                to="/teacher/analytics"
                label="Analytics"
                icon={<MdAnalytics />}
              />
              <SidebarLink
                to="/teacher/groups"
                label="Groups"
                icon={<MdGroups />}
              />
            </nav>
          </div>
        </aside>

        {/* Mobile drawer */}
        {open && (
          <div className="md:hidden fixed inset-0 z-40">
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl p-4">
              <div className="flex items-center justify-between">
                <div
                  className="font-bold text-primary-700 text-lg cursor-pointer"
                  onClick={() => {
                    setOpen(false);
                    navigate("/teacher");
                  }}
                >
                  Edulytics
                </div>
                <button
                  className="p-2 rounded-xl hover:bg-slate-100 cursor-pointer"
                  onClick={() => setOpen(false)}
                >
                  ✕
                </button>
              </div>

              <nav className="mt-4 space-y-1">
                <SidebarLink
                  to="/teacher"
                  label="Dashboard"
                  icon={<MdDashboard />}
                  end
                />
                <SidebarLink
                  to="/teacher/topics"
                  label="Topics"
                  icon={<MdTopic />}
                />
                <SidebarLink
                  to="/teacher/quizzes"
                  label="Quizzes"
                  icon={<MdOutlineQuiz />}
                />
                <SidebarLink
                  to="/teacher/analytics"
                  label="Analytics"
                  icon={<MdAnalytics />}
                />
                <SidebarLink
                  to="/teacher/groups"
                  label="Groups"
                  icon={<MdGroups />}
                />
              </nav>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

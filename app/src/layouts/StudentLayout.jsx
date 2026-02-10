import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiMenu, FiLogOut } from "react-icons/fi";
import {
  MdDashboard,
  MdOutlineQuiz,
  MdInsights,
  MdGroups,
} from "react-icons/md";

import SidebarLink from "../components/SidebarLink.jsx";
import { useAuthStore } from "../store/authStore.js";

export default function StudentLayout() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { user, clear } = useAuthStore();

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
    } catch {
      // ignore
    } finally {
      clear();
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
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
              <div className="text-xs text-slate-500">Student workspace</div>
            </div>
          </div>

          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-3 py-2 text-white text-sm
                       hover:bg-primary-700 transition cursor-pointer"
          >
            <FiLogOut />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        {/* Sidebar desktop */}
        <aside className="hidden md:block">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3">
            <div className="px-3 py-2 text-xs text-slate-500">
              Signed in as{" "}
              <span className="font-medium text-slate-700">{user?.role}</span>
            </div>

            <nav className="mt-2 space-y-1">
              <SidebarLink
                to="/student"
                label="Dashboard"
                icon={<MdDashboard />}
                end
              />
              <SidebarLink
                to="/student/quizzes"
                label="Quizzes"
                icon={<MdOutlineQuiz />}
              />
              <SidebarLink
                to="/student/analysis"
                label="Analysis"
                icon={<MdInsights />}
              />
              <SidebarLink
                to="/student/group"
                label="My Group"
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
                    navigate("/student");
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
                  to="/student"
                  label="Dashboard"
                  icon={<MdDashboard />}
                  end
                />
                <SidebarLink
                  to="/student/quizzes"
                  label="Quizzes"
                  icon={<MdOutlineQuiz />}
                />
                <SidebarLink
                  to="/student/analysis"
                  label="Analysis"
                  icon={<MdInsights />}
                />
                <SidebarLink
                  to="/student/group"
                  label="My Group"
                  icon={<MdGroups />}
                />
              </nav>
            </div>
          </div>
        )}

        <main className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

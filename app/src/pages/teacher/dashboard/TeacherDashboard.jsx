import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useTeacherContextStore } from "../../../store/teacherContextStore.js";
import StatCard from "./StatCard.jsx";
import RecentAttempts from "./RecentAttempts.jsx";
import WeakTopicsBar from "./WeakTopicsBar.jsx";

export default function TeacherDashboard() {
  const { semesterId } = useTeacherContextStore();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!semesterId) return;

    const fetch = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/dashboard/teacher", {
          params: { semesterId },
          withCredentials: true,
        });
        setData(res.data);
      } catch {
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [semesterId]);

  if (!semesterId) {
    return (
      <div>
        <h1 className="text-lg font-semibold text-slate-800">Dashboard</h1>
        <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-6">
          <div className="font-medium text-slate-800">No semester selected</div>
          <div className="mt-1 text-sm text-slate-600">
            Select a course and semester from the top bar to see your dashboard.
          </div>
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return <div className="text-sm text-slate-600">Loading dashboard...</div>;
  }

  const { stats, recentAttempts, weakTopics } = data;
  const avgPct = stats.avgMastery
    ? `${Math.round(stats.avgMastery * 100)}%`
    : "No data";

  return (
    <div>
      <h1 className="text-lg font-semibold text-slate-800">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-600">
        Overview of your class this semester.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Students" value={stats.studentCount} />
        <StatCard label="Quizzes" value={stats.quizCount} />
        <StatCard label="Topics" value={stats.topicCount} />
        <StatCard label="Avg Mastery" value={avgPct} sub="across all topics" />
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">
            Recent Attempts
          </h2>
        </div>
        <RecentAttempts attempts={recentAttempts} />
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">
            Topics Needing Attention
          </h2>
          <Link
            to="/teacher/analytics"
            className="text-xs text-primary-600 hover:underline"
          >
            View full analysis →
          </Link>
        </div>
        <WeakTopicsBar topics={weakTopics} />
      </div>
    </div>
  );
}

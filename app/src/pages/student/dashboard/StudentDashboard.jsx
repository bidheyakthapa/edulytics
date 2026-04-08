import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../../../store/authStore.js";
import StatCard from "./StatCard.jsx";
import NextStepCard from "./NextStepCard.jsx";

function getMasteryMessage(avg) {
  if (avg === null) return "Start attempting quizzes to track your progress.";
  if (avg < 0.4) return "Keep practicing — you're building your foundation.";
  if (avg < 0.7) return "Good progress — keep pushing!";
  return "Great work — you're mastering the material!";
}

export default function StudentDashboard() {
  const { user } = useAuthStore();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get("/api/dashboard/student", {
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
  }, []);

  if (loading || !data) {
    return <div className="text-sm text-slate-600">Loading dashboard...</div>;
  }

  const { stats, weakestTopic, strongestTopic } = data;

  const avgPct =
    stats.avgMastery !== null ? `${Math.round(stats.avgMastery * 100)}%` : "—";

  const quizzesLeft = stats.totalQuizzes - stats.attemptedQuizzes;

  return (
    <div>
      {/* Welcome */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="font-semibold text-slate-800">
          Welcome back, {user?.name} 👋
        </div>
        <div className="mt-1 text-sm text-slate-500">
          {getMasteryMessage(stats.avgMastery)}
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Quizzes Attempted"
          value={`${stats.attemptedQuizzes} / ${stats.totalQuizzes}`}
          sub={quizzesLeft > 0 ? `${quizzesLeft} remaining` : "All done!"}
        />
        <StatCard label="Avg Mastery" value={avgPct} sub="across all topics" />
        <StatCard
          label="Strongest Topic"
          value={strongestTopic ? strongestTopic.name : "—"}
          sub={
            strongestTopic
              ? `${Math.round(strongestTopic.p_know * 100)}%`
              : "No data yet"
          }
        />
      </div>

      {/* Next steps */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-slate-700">Next Steps</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <NextStepCard
            label="Quizzes"
            value={
              quizzesLeft > 0
                ? `${quizzesLeft} quiz${quizzesLeft > 1 ? "zes" : ""} to attempt`
                : "All quizzes done!"
            }
            sub="Keep your mastery up to date"
            to="/student/quizzes"
          />
          <NextStepCard
            label="Weakest Topic"
            value={weakestTopic ? weakestTopic.name : "No data yet"}
            sub={
              weakestTopic
                ? `Currently at ${Math.round(weakestTopic.p_know * 100)}% — needs work`
                : "Attempt quizzes to see your weak areas"
            }
            to="/student/analysis"
          />
        </div>
      </div>
    </div>
  );
}

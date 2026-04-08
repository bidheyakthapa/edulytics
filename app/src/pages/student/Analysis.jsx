import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function StudentAnalysis() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get("/api/student/analysis", {
          withCredentials: true,
        });
        setTopics(res.data);
      } catch {
        toast.error("Failed to load analysis");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="text-sm text-slate-600">Loading...</div>;

  if (topics.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
        <div className="font-medium text-slate-800">No data yet</div>
        <div className="mt-1 text-sm text-slate-600">
          Attempt some quizzes to see your topic mastery here.
        </div>
      </div>
    );
  }

  const strongest = [...topics].sort((a, b) => b.p_know - a.p_know)[0];
  const weakest = topics[0]; // already ordered weakest first from backend

  return (
    <div>
      <h1 className="text-lg font-semibold text-slate-800">My Analysis</h1>
      <p className="mt-1 text-sm text-slate-600">
        Your topic mastery based on quiz performance.
      </p>

      {/* Summary cards */}
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Topics Attempted" value={topics.length} />
        <SummaryCard
          label="Strongest Topic"
          value={strongest.topic_name}
          sub={pct(strongest.p_know)}
          color="text-green-700"
        />
        <SummaryCard
          label="Weakest Topic"
          value={weakest.topic_name}
          sub={pct(weakest.p_know)}
          color="text-red-500"
        />
      </div>

      {/* Mastery bars */}
      <div className="mt-6 space-y-3">
        {topics.map((topic) => (
          <MasteryBar key={topic.topic_id} topic={topic} />
        ))}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, sub, color }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`mt-1 font-semibold text-slate-800 truncate ${color}`}>
        {value}
      </div>
      {sub && <div className="text-xs text-slate-400">{sub}</div>}
    </div>
  );
}

function MasteryBar({ topic }) {
  const percentage = Math.round(topic.p_know * 100);

  const barColor =
    percentage >= 70
      ? "bg-green-400"
      : percentage >= 40
        ? "bg-amber-400"
        : "bg-red-400";

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{topic.topic_name}</span>
        <span className="text-slate-500">{percentage}%</span>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mt-1 text-xs text-slate-400">
        {topic.attempt_count} questions attempted
      </div>
    </div>
  );
}

function pct(p_know) {
  return `${Math.round(p_know * 100)}%`;
}

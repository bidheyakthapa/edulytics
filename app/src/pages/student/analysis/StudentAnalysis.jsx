import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import SummaryCard from "./SummaryCard.jsx";
import MasteryBar from "./MasteryBar.jsx";

function pct(p_know) {
  return `${Math.round(p_know * 100)}%`;
}

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

  if (loading) {
    return <div className="text-sm text-slate-600">Loading...</div>;
  }

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
  const weakest = topics[0];

  return (
    <div>
      <h1 className="text-lg font-semibold text-slate-800">My Analysis</h1>
      <p className="mt-1 text-sm text-slate-600">
        Your topic mastery based on quiz performance.
      </p>

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

      <div className="mt-6 space-y-3">
        {topics.map((topic) => (
          <MasteryBar key={topic.topic_id} topic={topic} />
        ))}
      </div>
    </div>
  );
}

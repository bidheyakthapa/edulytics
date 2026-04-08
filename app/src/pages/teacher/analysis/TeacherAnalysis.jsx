import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useTeacherContextStore } from "../../../store/teacherContextStore.js";
import TopicBar from "./TopicBar.jsx";
import StudentGrid from "./StudentGrid.jsx";

export default function TeacherAnalysis() {
  const { semesterId } = useTeacherContextStore();

  const [topics, setTopics] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!semesterId) return;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [topicsRes, studentsRes] = await Promise.all([
          axios.get("/api/analysis/topics", {
            params: { semesterId },
            withCredentials: true,
          }),
          axios.get("/api/analysis/students", {
            params: { semesterId },
            withCredentials: true,
          }),
        ]);
        setTopics(topicsRes.data);
        setStudents(studentsRes.data);
      } catch {
        toast.error("Failed to load analysis");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [semesterId]);

  if (!semesterId) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
        <div className="font-medium text-slate-800">No semester selected</div>
        <div className="mt-1 text-sm text-slate-600">
          Select a course and semester from the top bar to view analysis.
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="text-sm text-slate-600">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-lg font-semibold text-slate-800">Class Analysis</h1>
      <p className="mt-1 text-sm text-slate-600">
        Topic mastery and student performance for this semester.
      </p>

      <div className="mt-6">
        <h2 className="text-sm font-semibold text-slate-700">
          Topic Mastery — Class Average
        </h2>
        {topics.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm text-slate-500">
            No mastery data yet for this semester.
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {topics.map((topic) => (
              <TopicBar key={topic.topic_id} topic={topic} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-slate-700">
          Student Mastery Breakdown
        </h2>
        <StudentGrid students={students} />
      </div>
    </div>
  );
}

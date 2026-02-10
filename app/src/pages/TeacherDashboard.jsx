import { useAuthStore } from "../store/authStore.js";

export default function TeacherDashboard() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-5">
          <h1 className="text-xl font-semibold text-slate-800">
            Teacher Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Welcome, <span className="font-medium">{user?.id}</span> — build
            quizzes, topics and groups.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card title="Create Topics" desc="Add topics for a semester." />
          <Card title="Create Quiz" desc="Build quizzes with topic tagging." />
          <Card title="Analytics" desc="See mastery by topic/student." />
          <Card title="Create Groups" desc="Generate balanced groups (GA)." />
        </div>
      </main>
    </div>
  );
}

function Card({ title, desc }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="text-sm font-semibold text-primary-700">{title}</div>
      <div className="mt-2 text-sm text-slate-600">{desc}</div>
      <div className="mt-4 h-1 w-12 rounded-full bg-primary-600" />
    </div>
  );
}

import { useAuthStore } from "../store/authStore.js";

export default function StudentDashboard() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-5">
          <h1 className="text-xl font-semibold text-slate-800">
            Student Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Welcome back — track your topic mastery and attempt quizzes.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card
            title="Available Quizzes"
            desc="Attempt quizzes for your semester."
          />
          <Card title="Topic Mastery" desc="See weak vs strong topics." />
          <Card title="My Group" desc="Your assigned project group." />
          <Card title="Practice" desc="Practice weak topics (not saved)." />
        </div>

        <div className="mt-8 rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-800">Session</div>
          <pre className="mt-3 text-xs bg-slate-50 border rounded-xl p-3 overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
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
      <div className="mt-4 h-1 w-12 rounded-full bg-accent-500" />
    </div>
  );
}

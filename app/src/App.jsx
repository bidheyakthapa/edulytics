import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore.js";

import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";

import TeacherLayout from "./layouts/TeacherLayout.jsx";
import StudentLayout from "./layouts/StudentLayout.jsx";

// pages
import TeacherDashboard from "./pages/teacher/Dashboard.jsx";
import TeacherTopics from "./pages/teacher/Topics.jsx";

import StudentDashboard from "./pages/student/Dashboard.jsx";

export default function App() {
  const fetchMe = useAuthStore((s) => s.fetchMe);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Teacher */}
        <Route element={<ProtectedRoute role="TEACHER" />}>
          <Route path="/teacher" element={<TeacherLayout />}>
            <Route index element={<TeacherDashboard />} />
            <Route path="topics" element={<TeacherTopics />} />
            <Route path="quizzes" element={<div>Quizzes (coming)</div>} />
            <Route path="analytics" element={<div>Analytics (coming)</div>} />
            <Route path="groups" element={<div>Groups (coming)</div>} />
          </Route>
        </Route>

        {/* Student */}
        <Route element={<ProtectedRoute role="STUDENT" />}>
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<StudentDashboard />} />
            <Route path="quizzes" element={<div>Quizzes (coming)</div>} />
            <Route path="analysis" element={<div>Analysis (coming)</div>} />
            <Route path="group" element={<div>My Group (coming)</div>} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

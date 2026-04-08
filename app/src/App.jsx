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

import TeacherTopics from "./pages/teacher/Topics.jsx";
import TeacherQuizzes from "./pages/teacher/Quizzes.jsx";
import StudentQuizzes from "./pages/student/Quizzes.jsx";
import TeacherAnalysis from "./pages/teacher/analysis/TeacherAnalysis.jsx";
import StudentAnalysis from "./pages/student/analysis/StudentAnalysis.jsx";
import StudentGroup from "./pages/student/groups/StudentGroup.jsx";
import TeacherGroups from "./pages/teacher/groups/TeacherGroups.jsx";
import TeacherDashboard from "./pages/teacher/dashboard/TeacherDashboard.jsx";
import StudentDashboard from "./pages/student/dashboard/StudentDashboard.jsx";

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
            <Route path="quizzes" element={<TeacherQuizzes />} />
            <Route path="analytics" element={<TeacherAnalysis />} />
            <Route path="groups" element={<TeacherGroups />} />
          </Route>
        </Route>

        {/* Student */}
        <Route element={<ProtectedRoute role="STUDENT" />}>
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<StudentDashboard />} />
            <Route path="quizzes" element={<StudentQuizzes />} />
            <Route path="analysis" element={<StudentAnalysis />} />
            <Route path="group" element={<StudentGroup />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

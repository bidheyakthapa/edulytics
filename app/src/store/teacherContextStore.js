import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useTeacherContextStore = create(
  persist(
    (set) => ({
      courseId: "",
      semesterId: "",

      setCourseId: (courseId) => set({ courseId, semesterId: "" }),
      setSemesterId: (semesterId) => set({ semesterId }),
      reset: () => set({ courseId: "", semesterId: "" }),
    }),
    {
      name: "edulytics-teacher-context",
    },
  ),
);

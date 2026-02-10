import { create } from "zustand";

export const useSignupStore = create((set) => ({
  step: 1,
  form: {
    role: "STUDENT",
    name: "",
    email: "",
    password: "",

    // student-only
    course_id: "",
    semester_id: "",
    frontend_level: 0,
    backend_level: 0,
    mobile_level: 0,
    uiux_level: 0,
  },

  setField: (key, value) =>
    set((state) => ({
      form: { ...state.form, [key]: value },
    })),

  next: () => set((state) => ({ step: state.step + 1 })),
  prev: () => set((state) => ({ step: Math.max(1, state.step - 1) })),

  reset: () =>
    set({
      step: 1,
      form: {
        role: "STUDENT",
        name: "",
        email: "",
        password: "",
        course_id: "",
        semester_id: "",
        frontend_level: 0,
        backend_level: 0,
        mobile_level: 0,
        uiux_level: 0,
      },
    }),
}));

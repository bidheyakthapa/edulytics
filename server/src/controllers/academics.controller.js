import db from "../db.js";

export const getCourses = async (req, res) => {
  try {
    const [courses] = await db.execute(
      "SELECT id, name, code FROM courses ORDER BY code ASC",
    );
    return res.status(200).json(courses);
  } catch (error) {
    console.error("getCourses error:", error);
    return res.status(500).json({ message: "Failed to fetch courses" });
  }
};

export const getSemesters = async (req, res) => {
  const { courseId } = req.query;

  if (!courseId) {
    return res.status(400).json({ message: "courseId is required" });
  }

  try {
    const [semesters] = await db.execute(
      "SELECT id, semester_no FROM semesters WHERE course_id = ? ORDER BY semester_no ASC",
      [courseId],
    );

    return res.status(200).json(semesters);
  } catch (error) {
    console.error("getSemesters error:", error);
    return res.status(500).json({ message: "Failed to fetch semesters" });
  }
};

import db from "../db.js";

export const getAnalysis = async (req, res) => {
  try {
    const [result] = await db.execute(
      `SELECT s.topic_id, s.p_know, s.attempt_count, t.name AS topic_name
       FROM student_topic_mastery AS s
       LEFT JOIN topics AS t ON s.topic_id = t.id
       WHERE s.student_id = ?
       ORDER BY s.p_know ASC`,
      [req.user.id],
    );

    const parsed = result.map((row) => ({
      ...row,
      p_know: parseFloat(row.p_know),
    }));

    return res.status(200).json(parsed);
  } catch (error) {
    console.error("getStudentAnalysis error:", error);
    return res.status(500).json({ message: "Failed to get your analysis" });
  }
};

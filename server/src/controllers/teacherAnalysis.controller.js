import db from "../db.js";

export const getTopicAnalysis = async (req, res) => {
  const { semesterId } = req.query;

  if (!semesterId) {
    return res.status(400).json({ message: "semesterId is required" });
  }

  try {
    const [result] = await db.execute(
      `SELECT 
        t.id AS topic_id,
        t.name AS topic_name,
        AVG(stm.p_know) AS avg_mastery,
        COUNT(DISTINCT stm.student_id) AS student_count
       FROM topics t
       LEFT JOIN student_topic_mastery stm ON stm.topic_id = t.id
       WHERE t.semester_id = ? AND t.teacher_id = ?
       GROUP BY t.id
       ORDER BY avg_mastery IS NULL ASC, 
       avg_mastery ASC`,
      [semesterId, req.user.id],
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("getTopicAnalysis error:", error);
    return res.status(500).json({ message: "Failed to get topic analysis" });
  }
};

export const getStudentAnalysis = async (req, res) => {
  const { semesterId } = req.query;

  if (!semesterId) {
    return res.status(400).json({ message: "semesterId is required" });
  }

  try {
    const [students] = await db.execute(
      `SELECT u.id, u.name
       FROM users u
       JOIN student_profiles sp ON sp.student_id = u.id
       WHERE sp.semester_id = ?
       ORDER BY (
        SELECT COUNT(*) FROM student_topic_mastery 
        WHERE student_id = u.id
       ) DESC, u.name ASC`,
      [semesterId],
    );

    if (students.length === 0) {
      return res.status(200).json([]);
    }

    const [topics] = await db.execute(
      `SELECT id, name FROM topics
       WHERE semester_id = ? AND teacher_id = ?
       ORDER BY name ASC`,
      [semesterId, req.user.id],
    );

    if (topics.length === 0) {
      return res.status(200).json([]);
    }

    const studentIds = students.map((s) => s.id);
    const topicIds = topics.map((t) => t.id);

    const studentPlaceholders = studentIds.map(() => "?").join(",");
    const topicPlaceholders = topicIds.map(() => "?").join(",");

    const [masteryRows] = await db.execute(
      `SELECT student_id, topic_id, p_know
       FROM student_topic_mastery
       WHERE student_id IN (${studentPlaceholders})
       AND topic_id IN (${topicPlaceholders})`,
      [...studentIds, ...topicIds],
    );

    const masteryMap = {};
    for (const row of masteryRows) {
      if (!masteryMap[row.student_id]) masteryMap[row.student_id] = {};
      masteryMap[row.student_id][row.topic_id] = parseFloat(row.p_know);
    }

    const result = students.map((student) => ({
      student_id: student.id,
      student_name: student.name,
      topics: topics.map((topic) => ({
        topic_id: topic.id,
        topic_name: topic.name,
        p_know: masteryMap[student.id]?.[topic.id] ?? null,
      })),
    }));

    return res.status(200).json(result);
  } catch (error) {
    console.error("getStudentAnalysis error:", error);
    return res.status(500).json({ message: "Failed to get student analysis" });
  }
};

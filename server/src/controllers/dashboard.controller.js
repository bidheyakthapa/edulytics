import db from "../db.js";

export const getTeacherDashboard = async (req, res) => {
  const { semesterId } = req.query;

  if (!semesterId) {
    return res.status(400).json({ message: "semesterId is required" });
  }

  try {
    // total students in semester
    const [[{ studentCount }]] = await db.execute(
      `SELECT COUNT(*) AS studentCount
       FROM student_profiles
       WHERE semester_id = ?`,
      [semesterId],
    );

    // total quizzes created by this teacher in this semester
    const [[{ quizCount }]] = await db.execute(
      `SELECT COUNT(*) AS quizCount
       FROM quizzes
       WHERE teacher_id = ? AND semester_id = ?`,
      [req.user.id, semesterId],
    );

    // total topics created by this teacher in this semester
    const [[{ topicCount }]] = await db.execute(
      `SELECT COUNT(*) AS topicCount
       FROM topics
       WHERE teacher_id = ? AND semester_id = ?`,
      [req.user.id, semesterId],
    );

    // class average mastery across all topics in this semester
    const [[{ avgMastery }]] = await db.execute(
      `SELECT AVG(stm.p_know) AS avgMastery
       FROM student_topic_mastery stm
       JOIN topics t ON t.id = stm.topic_id
       WHERE t.teacher_id = ? AND t.semester_id = ?`,
      [req.user.id, semesterId],
    );

    // last 5 quiz attempts in this semester
    const [recentAttempts] = await db.execute(
      `SELECT
        u.name AS student_name,
        q.title AS quiz_title,
        qa.total_score,
        q.id AS quiz_id,
        (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) AS total_questions,
        qa.attempted_at
       FROM quiz_attempts qa
       JOIN users u ON u.id = qa.student_id
       JOIN quizzes q ON q.id = qa.quiz_id
       WHERE q.semester_id = ? AND q.teacher_id = ?
       ORDER BY qa.attempted_at DESC
       LIMIT 5`,
      [semesterId, req.user.id],
    );

    // bottom 3 topics by average mastery
    const [weakTopics] = await db.execute(
      `SELECT
        t.name AS topic_name,
        AVG(stm.p_know) AS avg_mastery
       FROM topics t
       LEFT JOIN student_topic_mastery stm ON stm.topic_id = t.id
       WHERE t.teacher_id = ? AND t.semester_id = ?
       GROUP BY t.id
       ORDER BY avg_mastery ASC
       LIMIT 3`,
      [req.user.id, semesterId],
    );

    return res.status(200).json({
      stats: {
        studentCount,
        quizCount,
        topicCount,
        avgMastery: avgMastery ? parseFloat(avgMastery) : null,
      },
      recentAttempts,
      weakTopics: weakTopics.map((t) => ({
        ...t,
        avg_mastery: t.avg_mastery ? parseFloat(t.avg_mastery) : null,
      })),
    });
  } catch (error) {
    console.error("getTeacherDashboard error:", error);
    return res.status(500).json({ message: "Failed to load dashboard" });
  }
};

export const getStudentDashboard = async (req, res) => {
  const studentId = req.user.id;

  try {
    const [[profile]] = await db.execute(
      `SELECT semester_id FROM student_profiles WHERE student_id = ?`,
      [studentId],
    );

    if (!profile) {
      return res.status(403).json({ message: "Student profile not found" });
    }

    const { semester_id } = profile;

    // total quizzes available and how many attempted
    const [[quizStats]] = await db.execute(
      `SELECT
        COUNT(DISTINCT q.id) AS totalQuizzes,
        COUNT(DISTINCT qa.id) AS attemptedQuizzes
       FROM quizzes q
       LEFT JOIN quiz_attempts qa
         ON qa.quiz_id = q.id AND qa.student_id = ?
       WHERE q.semester_id = ?`,
      [studentId, semester_id],
    );

    // overall mastery average + strongest and weakest topic
    const [masteryRows] = await db.execute(
      `SELECT stm.p_know, t.name AS topic_name
       FROM student_topic_mastery stm
       JOIN topics t ON t.id = stm.topic_id
       WHERE stm.student_id = ?
       ORDER BY stm.p_know ASC`,
      [studentId],
    );

    const avgMastery =
      masteryRows.length > 0
        ? masteryRows.reduce((sum, r) => sum + parseFloat(r.p_know), 0) /
          masteryRows.length
        : null;

    const weakestTopic = masteryRows.length > 0 ? masteryRows[0] : null;
    const strongestTopic =
      masteryRows.length > 0 ? masteryRows[masteryRows.length - 1] : null;

    return res.status(200).json({
      stats: {
        totalQuizzes: quizStats.totalQuizzes,
        attemptedQuizzes: quizStats.attemptedQuizzes,
        avgMastery,
      },
      weakestTopic: weakestTopic
        ? {
            name: weakestTopic.topic_name,
            p_know: parseFloat(weakestTopic.p_know),
          }
        : null,
      strongestTopic: strongestTopic
        ? {
            name: strongestTopic.topic_name,
            p_know: parseFloat(strongestTopic.p_know),
          }
        : null,
    });
  } catch (error) {
    console.error("getStudentDashboard error:", error);
    return res.status(500).json({ message: "Failed to load dashboard" });
  }
};

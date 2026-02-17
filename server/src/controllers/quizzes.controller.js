import db from "../db.js";

export const createQuiz = async (req, res) => {
  const { semester_id, title, description, time_limit_sec, questions } =
    req.body;

  const connection = await db.getConnection();

  try {
    for (const q of questions) {
      const correctCount = q.options.filter(
        (o) => o.is_correct === true,
      ).length;
      if (correctCount !== 1) {
        return res.status(400).json({
          message: "Validation failed",
          errors: [
            `Each question must have exactly 1 correct option. Problem in: "${q.question_text}"`,
          ],
        });
      }
    }

    const topicIds = [...new Set(questions.map((q) => q.topic_id))];
    if (topicIds.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one topic is required" });
    }

    const placeholders = topicIds.map(() => "?").join(",");
    const [topics] = await connection.execute(
      `SELECT id FROM topics WHERE id IN (${placeholders}) AND teacher_id = ? AND semester_id = ?`,
      [...topicIds, req.user.id, semester_id],
    );

    if (topics.length !== topicIds.length) {
      return res.status(400).json({
        message:
          "Some topic_id values are invalid or do not belong to your selected semester.",
      });
    }

    await connection.beginTransaction();

    const [quizResult] = await connection.execute(
      `INSERT INTO quizzes (semester_id, teacher_id, title, description, time_limit_sec)
       VALUES (?, ?, ?, ?, ?)`,
      [
        semester_id,
        req.user.id,
        title,
        description ?? null,
        time_limit_sec ?? 600,
      ],
    );

    const quizId = quizResult.insertId;

    for (const q of questions) {
      const [qRes] = await connection.execute(
        `INSERT INTO quiz_questions (quiz_id, topic_id, question_text)
         VALUES (?, ?, ?)`,
        [quizId, q.topic_id, q.question_text],
      );

      const quizQuestionId = qRes.insertId;

      for (const opt of q.options) {
        await connection.execute(
          `INSERT INTO quiz_options (quiz_question_id, option_text, is_correct)
           VALUES (?, ?, ?)`,
          [quizQuestionId, opt.option_text, opt.is_correct],
        );
      }
    }

    await connection.commit();

    return res.status(201).json({
      message: "Successfully created quiz",
      quizId,
    });
  } catch (error) {
    console.error("createQuiz error:", error);
    try {
      await connection.rollback();
    } catch {}

    return res.status(500).json({ message: "Failed to create quiz" });
  } finally {
    connection.release();
  }
};

export const getTeacherQuizzes = async (req, res) => {
  const { semesterId } = req.query;

  try {
    const params = [req.user.id];
    let sql =
      "SELECT id, title, description, time_limit_sec, created_at FROM quizzes WHERE teacher_id = ?";

    if (semesterId) {
      sql += " AND semester_id = ?";
      params.push(semesterId);
    }

    sql += " ORDER BY created_at DESC";

    const [quizzes] = await db.execute(sql, params);
    return res.status(200).json(quizzes);
  } catch (error) {
    console.error("getTeacherQuizzes error:", error);
    return res.status(500).json({ message: "Failed to fetch quizzes" });
  }
};

export const getQuizById = async (req, res) => {
  const { id } = req.params;

  try {
    const [quizRows] = await db.execute(
      `SELECT id, semester_id, teacher_id, title, description, time_limit_sec, created_at
       FROM quizzes
       WHERE id = ? AND teacher_id = ?`,
      [id, req.user.id],
    );

    if (quizRows.length === 0) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const quiz = quizRows[0];

    const [questions] = await db.execute(
      `SELECT id, topic_id, question_text
       FROM quiz_questions
       WHERE quiz_id = ?
       ORDER BY id ASC`,
      [id],
    );

    if (questions.length === 0) {
      return res.status(200).json({ quiz, questions: [] });
    }

    const qIds = questions.map((q) => q.id);
    const placeholders = qIds.map(() => "?").join(",");

    const [options] = await db.execute(
      `SELECT id, quiz_question_id, option_text, is_correct
       FROM quiz_options
       WHERE quiz_question_id IN (${placeholders})
       ORDER BY id ASC`,
      qIds,
    );

    const optionsByQuestion = new Map();
    for (const opt of options) {
      if (!optionsByQuestion.has(opt.quiz_question_id)) {
        optionsByQuestion.set(opt.quiz_question_id, []);
      }
      optionsByQuestion.get(opt.quiz_question_id).push(opt);
    }

    const nested = questions.map((q) => ({
      ...q,
      options: optionsByQuestion.get(q.id) || [],
    }));

    const [aRows] = await db.execute(
      "SELECT COUNT(*) AS attemptCount FROM quiz_attempts WHERE quiz_id = ?",
      [id],
    );
    const attemptCount = aRows[0]?.attemptCount || 0;

    return res
      .status(200)
      .json({ quiz, questions: nested, attemptCount: attemptCount });
  } catch (error) {
    console.error("getQuizById error:", error);
    return res.status(500).json({ message: "Failed to fetch quiz" });
  }
};

export const updateQuizMeta = async (req, res) => {
  const { id } = req.params;
  const { title, description, time_limit_sec } = req.body;

  try {
    const [result] = await db.execute(
      `UPDATE quizzes
       SET title = ?, description = ?, time_limit_sec = ?
       WHERE id = ? AND teacher_id = ?`,
      [title, description ?? null, time_limit_sec ?? 600, id, req.user.id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    return res.status(200).json({ message: "Quiz meta updated successfully" });
  } catch (error) {
    console.error("updateQuizMeta error:", error);
    return res.status(500).json({ message: "Failed to update quiz meta" });
  }
};

export const updateQuiz = async (req, res) => {
  const { id } = req.params;
  const { semester_id, title, description, time_limit_sec, questions } =
    req.body;

  const connection = await db.getConnection();

  try {
    const [quizRows] = await connection.execute(
      "SELECT id FROM quizzes WHERE id = ? AND teacher_id = ?",
      [id, req.user.id],
    );

    if (quizRows.length === 0) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const [attemptRows] = await connection.execute(
      "SELECT id FROM quiz_attempts WHERE quiz_id = ? LIMIT 1",
      [id],
    );

    if (attemptRows.length > 0) {
      return res.status(409).json({
        message:
          "This quiz already has attempts. You can only edit title/description/time.",
      });
    }

    for (const q of questions) {
      const correctCount = q.options.filter(
        (o) => o.is_correct === true,
      ).length;
      if (correctCount !== 1) {
        return res.status(400).json({
          message: "Validation failed",
          errors: [
            `Each question must have exactly 1 correct option. Problem in: "${q.question_text}"`,
          ],
        });
      }
    }

    const topicIds = [...new Set(questions.map((q) => q.topic_id))];
    if (topicIds.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one topic is required" });
    }

    const placeholders = topicIds.map(() => "?").join(",");
    const [topics] = await connection.execute(
      `SELECT id FROM topics WHERE id IN (${placeholders}) AND teacher_id = ? AND semester_id = ?`,
      [...topicIds, req.user.id, semester_id],
    );

    if (topics.length !== topicIds.length) {
      return res.status(400).json({
        message:
          "Some topic_id values are invalid or do not belong to your selected semester.",
      });
    }

    await connection.beginTransaction();

    await connection.execute(
      `UPDATE quizzes
       SET semester_id = ?, title = ?, description = ?, time_limit_sec = ?
       WHERE id = ? AND teacher_id = ?`,
      [
        semester_id,
        title,
        description ?? null,
        time_limit_sec ?? 600,
        id,
        req.user.id,
      ],
    );

    await connection.execute("DELETE FROM quiz_questions WHERE quiz_id = ?", [
      id,
    ]);

    for (const q of questions) {
      const [qRes] = await connection.execute(
        `INSERT INTO quiz_questions (quiz_id, topic_id, question_text)
         VALUES (?, ?, ?)`,
        [id, q.topic_id, q.question_text],
      );

      const quizQuestionId = qRes.insertId;

      for (const opt of q.options) {
        await connection.execute(
          `INSERT INTO quiz_options (quiz_question_id, option_text, is_correct)
           VALUES (?, ?, ?)`,
          [quizQuestionId, opt.option_text, opt.is_correct],
        );
      }
    }

    await connection.commit();

    return res.status(200).json({ message: "Quiz updated successfully" });
  } catch (error) {
    console.error("updateQuiz error:", error);
    try {
      await connection.rollback();
    } catch {}

    return res.status(500).json({ message: "Failed to update quiz" });
  } finally {
    connection.release();
  }
};

export const deleteQuiz = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.execute(
      "DELETE FROM quizzes WHERE id = ? AND teacher_id = ?",
      [id, req.user.id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    return res.status(200).json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error("deleteQuiz error:", error);
    return res.status(500).json({ message: "Failed to delete quiz" });
  }
};

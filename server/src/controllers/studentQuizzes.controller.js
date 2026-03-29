import db from "../db.js";
import { updateMasteryForStudent } from "../services/masteryService.js";

export const getQuizzes = async (req, res) => {
  try {
    const [profileRows] = await db.execute(
      `SELECT semester_id
       FROM student_profiles
       WHERE student_id = ?`,
      [req.user.id],
    );

    if (profileRows.length === 0) {
      return res.status(403).json({ message: "You are not a student" });
    }

    const semesterId = profileRows[0].semester_id;

    const [result] = await db.execute(
      `SELECT 
        q.id,
        q.title,
        q.description,
        q.time_limit_sec,
        COUNT(qa.id) AS attemptCount
       FROM quizzes q
       LEFT JOIN quiz_attempts qa
         ON qa.quiz_id = q.id AND qa.student_id = ?
       WHERE q.semester_id = ?
       GROUP BY q.id
       ORDER BY q.created_at DESC`,
      [req.user.id, semesterId],
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("getQuizzes error:", error);
    return res.status(500).json({ message: "Failed to fetch quizzes" });
  }
};

export const getQuizById = async (req, res) => {
  const { id } = req.params;

  try {
    const [profileRows] = await db.execute(
      `SELECT semester_id
       FROM student_profiles
       WHERE student_id = ?`,
      [req.user.id],
    );

    if (profileRows.length === 0) {
      return res.status(403).json({ message: "You are not a student" });
    }

    const semesterId = profileRows[0].semester_id;

    const [quizRows] = await db.execute(
      `SELECT id, semester_id, title, description, time_limit_sec
       FROM quizzes
       WHERE id = ?`,
      [id],
    );

    if (quizRows.length === 0) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const quiz = quizRows[0];

    if (Number(quiz.semester_id) !== Number(semesterId)) {
      return res
        .status(403)
        .json({ message: "You do not belong to this quiz" });
    }

    const [aRows] = await db.execute(
      `SELECT COUNT(*) AS attemptCount
       FROM quiz_attempts
       WHERE quiz_id = ? AND student_id = ?`,
      [id, req.user.id],
    );
    const attemptCount = aRows[0]?.attemptCount || 0;

    const [questions] = await db.execute(
      `SELECT id, topic_id, question_text
       FROM quiz_questions
       WHERE quiz_id = ?
       ORDER BY id ASC`,
      [id],
    );

    if (questions.length === 0) {
      return res.status(200).json({ quiz, questions: [], attemptCount });
    }

    const qIds = questions.map((q) => q.id);
    const placeholders = qIds.map(() => "?").join(",");

    const [options] = await db.execute(
      `SELECT id, quiz_question_id, option_text
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

    return res.status(200).json({
      quiz,
      questions: nested,
      attemptCount,
    });
  } catch (error) {
    console.error("getQuizById error:", error);
    return res.status(500).json({ message: "Failed to fetch quiz" });
  }
};

export const attemptQuiz = async (req, res) => {
  const quizId = req.params.id;
  const studentId = req.user.id;
  const { answers } = req.body;

  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ message: "Answers are required" });
  }

  const connection = await db.getConnection();
  let txStarted = false;

  try {
    const [profileRows] = await connection.execute(
      `SELECT semester_id
       FROM student_profiles
       WHERE student_id = ?`,
      [studentId],
    );

    if (profileRows.length === 0) {
      return res
        .status(403)
        .json({ message: "You are not a registered student" });
    }

    const studentSemesterId = profileRows[0].semester_id;

    const [quizRows] = await connection.execute(
      `SELECT id, semester_id
       FROM quizzes
       WHERE id = ?`,
      [quizId],
    );

    if (quizRows.length === 0) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const quiz = quizRows[0];

    if (Number(quiz.semester_id) !== Number(studentSemesterId)) {
      return res
        .status(403)
        .json({ message: "You do not belong to this quiz" });
    }

    const [existingAttempt] = await connection.execute(
      `SELECT id
       FROM quiz_attempts
       WHERE student_id = ? AND quiz_id = ?
       LIMIT 1`,
      [studentId, quizId],
    );

    if (existingAttempt.length > 0) {
      return res
        .status(409)
        .json({ message: "You may only attempt quiz once" });
    }

    const [questions] = await connection.execute(
      `SELECT id, topic_id
       FROM quiz_questions
       WHERE quiz_id = ?`,
      [quizId],
    );

    if (questions.length === 0) {
      return res.status(400).json({ message: "Quiz has no questions" });
    }

    const questionTopicMap = new Map();
    for (const q of questions) {
      questionTopicMap.set(Number(q.id), Number(q.topic_id));
    }

    const submittedQuestionIds = new Set();
    for (const ans of answers) {
      const qid = Number(ans.question_id);
      if (submittedQuestionIds.has(qid)) {
        return res
          .status(400)
          .json({ message: "Duplicate question submission detected" });
      }
      submittedQuestionIds.add(qid);
    }

    let totalCorrect = 0;
    const validatedAnswers = [];

    for (const ans of answers) {
      const question_id = Number(ans.question_id);
      const selected_option_id = Number(ans.selected_option_id);

      if (!questionTopicMap.has(question_id)) {
        return res
          .status(400)
          .json({ message: "Invalid question in submission" });
      }

      const [optionRows] = await connection.execute(
        `SELECT is_correct
         FROM quiz_options
         WHERE id = ? AND quiz_question_id = ?
         LIMIT 1`,
        [selected_option_id, question_id],
      );

      if (optionRows.length === 0) {
        return res.status(400).json({ message: "Invalid option selected" });
      }

      const isCorrect = optionRows[0].is_correct ? true : false;
      if (isCorrect) totalCorrect++;

      validatedAnswers.push({
        question_id,
        selected_option_id,
        topic_id: questionTopicMap.get(question_id),
        is_correct: isCorrect,
      });
    }

    for (const q of questions) {
      const qid = Number(q.id);
      if (!submittedQuestionIds.has(qid)) {
        validatedAnswers.push({
          question_id: qid,
          selected_option_id: null,
          topic_id: questionTopicMap.get(qid),
          is_correct: false,
        });
      }
    }

    await connection.beginTransaction();
    txStarted = true;

    const [attemptInsert] = await connection.execute(
      `INSERT INTO quiz_attempts (quiz_id, student_id, attempt_no, total_score)
       VALUES (?, ?, 1, ?)`,
      [quizId, studentId, totalCorrect],
    );

    const quizAttemptId = attemptInsert.insertId;

    for (const ans of validatedAnswers) {
      await connection.execute(
        `INSERT INTO quiz_question_attempts
          (quiz_attempt_id, quiz_question_id, topic_id, selected_option_id, is_correct)
         VALUES (?, ?, ?, ?, ?)`,
        [
          quizAttemptId,
          ans.question_id,
          ans.topic_id,
          ans.selected_option_id,
          ans.is_correct,
        ],
      );
    }

    await connection.commit();

    try {
      await updateMasteryForStudent(studentId, validatedAnswers);
    } catch (masteryError) {
      console.error("Mastery update failed:", masteryError);
    }

    return res.status(200).json({
      message: "Quiz submitted successfully",
      totalScore: totalCorrect,
      totalQuestions: questions.length,
    });
  } catch (error) {
    console.error("attemptQuiz error:", error);
    if (txStarted) {
      try {
        await connection.rollback();
      } catch {}
    }
    return res.status(500).json({ message: "Failed to attempt quiz" });
  } finally {
    connection.release();
  }
};

export const getQuizResult = async (req, res) => {
  const quizId = req.params.id;
  const studentId = req.user.id;

  try {
    const [profileRows] = await db.execute(
      `SELECT semester_id
       FROM student_profiles
       WHERE student_id = ?`,
      [studentId],
    );

    if (profileRows.length === 0) {
      return res.status(403).json({ message: "Student profile not found" });
    }

    const studentSemesterId = profileRows[0].semester_id;

    const [quizRows] = await db.execute(
      `SELECT id, semester_id, title, description, time_limit_sec, created_at
       FROM quizzes
       WHERE id = ?`,
      [quizId],
    );

    if (quizRows.length === 0) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const quiz = quizRows[0];

    if (Number(quiz.semester_id) !== Number(studentSemesterId)) {
      return res.status(403).json({ message: "You cannot access this quiz" });
    }

    const [attemptRows] = await db.execute(
      `SELECT id, total_score, attempted_at
       FROM quiz_attempts
       WHERE quiz_id = ? AND student_id = ?
       ORDER BY attempt_no DESC
       LIMIT 1`,
      [quizId, studentId],
    );

    if (attemptRows.length === 0) {
      return res
        .status(404)
        .json({ message: "No attempt found for this quiz" });
    }

    const attempt = attemptRows[0];

    const [rows] = await db.execute(
      `
      SELECT 
        qq.id AS question_id,
        qq.topic_id,
        qq.question_text,

        qqa.selected_option_id,
        so.option_text AS selected_option_text,

        qqa.is_correct,

        co.id AS correct_option_id,
        co.option_text AS correct_option_text
      FROM quiz_question_attempts qqa
      JOIN quiz_questions qq
        ON qq.id = qqa.quiz_question_id

      LEFT JOIN quiz_options so
        ON so.id = qqa.selected_option_id

      LEFT JOIN quiz_options co
        ON co.quiz_question_id = qq.id AND co.is_correct = 1

      WHERE qqa.quiz_attempt_id = ?
      ORDER BY qq.id ASC
      `,
      [attempt.id],
    );

    const questions = rows.map((r) => ({
      id: r.question_id,
      topic_id: r.topic_id,
      question_text: r.question_text,
      selected_option: {
        id: r.selected_option_id,
        text: r.selected_option_text,
      },
      correct_option: {
        id: r.correct_option_id,
        text: r.correct_option_text,
      },
      is_correct: Boolean(r.is_correct),
    }));

    return res.status(200).json({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        time_limit_sec: quiz.time_limit_sec,
        created_at: quiz.created_at,
      },
      attempt: {
        id: attempt.id,
        total_score: attempt.total_score,
        attempted_at: attempt.attempted_at,
        total_questions: questions.length,
      },
      questions,
    });
  } catch (error) {
    console.error("getQuizResult error:", error);
    return res.status(500).json({ message: "Failed to fetch result" });
  }
};

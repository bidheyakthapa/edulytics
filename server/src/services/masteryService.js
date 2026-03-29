import db from "../db.js";
import { updateKnowledge } from "../utils/bkt.js";

export async function updateMasteryForStudent(studentId, answers) {
  // answers = [{ topic_id, is_correct }, ...]

  const grouped = {};

  for (const ans of answers) {
    const tid = ans.topic_id;
    if (!grouped[tid]) grouped[tid] = [];
    grouped[tid].push(ans.is_correct);
  }

  for (const topicId of Object.keys(grouped)) {
    const [paramsRows] = await db.execute(
      `SELECT p_l0, p_t, p_s, p_g FROM bkt_topic_params WHERE topic_id = ?`,
      [topicId],
    );

    if (paramsRows.length == 0) continue;

    const params = paramsRows[0];

    const [fetchCurrentMastery] = await db.execute(
      `SELECT p_know FROM student_topic_mastery WHERE student_id = ? AND topic_id = ?`,
      [studentId, topicId],
    );

    let p_know =
      fetchCurrentMastery.length > 0
        ? parseFloat(fetchCurrentMastery[0].p_know)
        : parseFloat(params.p_l0);

    const topicAnswers = grouped[topicId];

    for (const isCorrect of topicAnswers) {
      p_know = updateKnowledge(p_know, params, isCorrect);
    }

    const answerCount = grouped[topicId].length;

    await db.execute(
      `INSERT INTO student_topic_mastery
       (student_id, topic_id, p_know, attempt_count, last_updated_at)
        VALUES (?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
            p_know = VALUES(p_know),
        attempt_count = attempt_count + ?,
        last_updated_at = NOW()`,
      [studentId, topicId, p_know, answerCount, answerCount],
    );
  }
}

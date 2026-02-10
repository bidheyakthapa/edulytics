import db from "../db.js";

export const getTopics = async (req, res) => {
  const { semesterId } = req.query;

  if (!semesterId) {
    return res.status(400).json({ message: "semesterId is required" });
  }

  try {
    const [topics] = await db.execute(
      "SELECT id, semester_id, teacher_id, name, created_at FROM topics WHERE semester_id = ? AND teacher_id = ? ORDER BY created_at DESC",
      [semesterId, req.user.id],
    );

    return res.status(200).json(topics);
  } catch (error) {
    console.error("getTopics error:", error);
    return res.status(500).json({ message: "Failed to fetch topics" });
  }
};

export const createTopic = async (req, res) => {
  //   const { semesterId } = req.query;

  const { name, semesterId } = req.body;

  try {
    const [result] = await db.execute(
      "INSERT INTO topics (semester_id, teacher_id, name) VALUES (?, ?, ?)",
      [semesterId, req.user.id, name.trim()],
    );

    return res.status(201).json({
      message: "Topic added successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("createTopic error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Topic already exists" });
    }

    return res.status(500).json({ message: "Failed to create topic" });
  }
};

export const updateTopic = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const [result] = await db.execute(
      "UPDATE topics SET name = ? WHERE id = ? AND teacher_id = ?",
      [name.trim(), id, req.user.id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Topic not found" });
    }

    return res.status(200).json({ message: "Topic updated successfully" });
  } catch (error) {
    console.error("updateTopic error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Topic already exists" });
    }

    return res.status(500).json({ message: "Failed to update topic" });
  }
};

export const deleteTopic = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.execute(
      "DELETE FROM topics WHERE id = ? AND teacher_id = ?",
      [id, req.user.id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Topic not found" });
    }

    return res.status(200).json({ message: "Topic deleted successfully" });
  } catch (error) {
    console.error("deleteTopic error:", error);
    return res.status(500).json({ message: "Failed to delete topic" });
  }
};

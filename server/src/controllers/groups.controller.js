import db from "../db.js";
import {
  computeComposite,
  serpentineDraft,
  greedySkillSwap,
} from "../utils/groupAlgorithm.js";

export const createProject = async (req, res) => {
  const { title, description, group_size, semester_id } = req.body;

  if (!title || !group_size || !semester_id) {
    return res
      .status(400)
      .json({ message: "title, group_size and semester_id are required" });
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO projects (teacher_id, course_id, semester_id, title, description, group_size)
       SELECT ?, s.course_id, ?, ?, ?, ?
       FROM semesters s WHERE s.id = ?`,
      [
        req.user.id,
        semester_id,
        title,
        description ?? null,
        group_size,
        semester_id,
      ],
    );

    return res.status(201).json({
      message: "Project created successfully",
      projectId: result.insertId,
    });
  } catch (error) {
    console.error("createProject error:", error);
    return res.status(500).json({ message: "Failed to create project" });
  }
};

export const getProjects = async (req, res) => {
  const { semesterId } = req.query;

  if (!semesterId) {
    return res.status(400).json({ message: "semesterId is required" });
  }

  try {
    const [projects] = await db.execute(
      `SELECT p.id, p.title, p.description, p.group_size, p.created_at,
              COUNT(DISTINCT pg.id) AS group_count
       FROM projects p
       LEFT JOIN project_groups pg ON pg.project_id = p.id
       WHERE p.semester_id = ? AND p.teacher_id = ?
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [semesterId, req.user.id],
    );

    return res.status(200).json(projects);
  } catch (error) {
    console.error("getProjects error:", error);
    return res.status(500).json({ message: "Failed to fetch projects" });
  }
};

export const generateGroups = async (req, res) => {
  const { id: projectId } = req.params;
  const connection = await db.getConnection();

  try {
    const [projectRows] = await connection.execute(
      `SELECT id, semester_id, group_size FROM projects
       WHERE id = ? AND teacher_id = ?`,
      [projectId, req.user.id],
    );

    if (projectRows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    const { semester_id, group_size } = projectRows[0];

    const [students] = await connection.execute(
      `SELECT u.id, u.name,
              sp.frontend_level, sp.backend_level,
              sp.mobile_level, sp.uiux_level
       FROM users u
       JOIN student_profiles sp ON sp.student_id = u.id
       WHERE sp.semester_id = ?`,
      [semester_id],
    );

    if (students.length === 0) {
      return res
        .status(400)
        .json({ message: "No students found in this semester" });
    }

    const studentIds = students.map((s) => s.id);
    const placeholders = studentIds.map(() => "?").join(",");

    const [masteryRows] = await connection.execute(
      `SELECT student_id, p_know
       FROM student_topic_mastery
       WHERE student_id IN (${placeholders})`,
      studentIds,
    );

    const masteryMap = {};
    for (const row of masteryRows) {
      if (!masteryMap[row.student_id]) masteryMap[row.student_id] = [];
      masteryMap[row.student_id].push({ p_know: parseFloat(row.p_know) });
    }

    const enriched = students.map((s) => ({
      ...s,
      topics: masteryMap[s.id] || [],
      composite: computeComposite({ ...s, topics: masteryMap[s.id] || [] }),
    }));

    enriched.sort((a, b) => b.composite - a.composite);

    const groupCount = Math.ceil(enriched.length / group_size);
    let groups = serpentineDraft(enriched, groupCount);
    groups = greedySkillSwap(groups);

    await connection.beginTransaction();

    await connection.execute(
      `DELETE FROM project_groups WHERE project_id = ?`,
      [projectId],
    );

    for (let i = 0; i < groups.length; i++) {
      const [groupResult] = await connection.execute(
        `INSERT INTO project_groups (project_id, group_number) VALUES (?, ?)`,
        [projectId, i + 1],
      );

      const groupId = groupResult.insertId;

      for (const student of groups[i]) {
        await connection.execute(
          `INSERT INTO group_members (group_id, student_id) VALUES (?, ?)`,
          [groupId, student.id],
        );
      }
    }

    await connection.commit();

    return res.status(200).json({ message: "Groups generated successfully" });
  } catch (error) {
    console.error("generateGroups error:", error);
    try {
      await connection.rollback();
    } catch {}
    return res.status(500).json({ message: "Failed to generate groups" });
  } finally {
    connection.release();
  }
};

export const getProjectGroups = async (req, res) => {
  const { id: projectId } = req.params;

  try {
    const [projectRows] = await db.execute(
      `SELECT id, title, description, group_size FROM projects
       WHERE id = ? AND teacher_id = ?`,
      [projectId, req.user.id],
    );

    if (projectRows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    const [groups] = await db.execute(
      `SELECT pg.id, pg.group_number,
              u.id AS student_id, u.name AS student_name,
              sp.frontend_level, sp.backend_level,
              sp.mobile_level, sp.uiux_level
       FROM project_groups pg
       LEFT JOIN group_members gm ON gm.group_id = pg.id
       LEFT JOIN users u ON u.id = gm.student_id
       LEFT JOIN student_profiles sp ON sp.student_id = u.id
       WHERE pg.project_id = ?
       ORDER BY pg.group_number ASC`,
      [projectId],
    );

    const groupMap = new Map();
    for (const row of groups) {
      if (!groupMap.has(row.group_number)) {
        groupMap.set(row.group_number, {
          id: row.id,
          group_number: row.group_number,
          members: [],
        });
      }
      if (row.student_id) {
        groupMap.get(row.group_number).members.push({
          id: row.student_id,
          name: row.student_name,
          frontend_level: row.frontend_level,
          backend_level: row.backend_level,
          mobile_level: row.mobile_level,
          uiux_level: row.uiux_level,
        });
      }
    }

    return res.status(200).json({
      project: projectRows[0],
      groups: Array.from(groupMap.values()),
    });
  } catch (error) {
    console.error("getProjectGroups error:", error);
    return res.status(500).json({ message: "Failed to fetch groups" });
  }
};

export const swapStudents = async (req, res) => {
  const { id: projectId } = req.params;
  const { student_a_id, student_b_id } = req.body;

  if (!student_a_id || !student_b_id) {
    return res.status(400).json({ message: "Both student IDs are required" });
  }

  const connection = await db.getConnection();

  try {
    const [projectRows] = await connection.execute(
      `SELECT id FROM projects WHERE id = ? AND teacher_id = ?`,
      [projectId, req.user.id],
    );

    if (projectRows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    const [memberRows] = await connection.execute(
      `SELECT gm.student_id, gm.group_id
       FROM group_members gm
       JOIN project_groups pg ON pg.id = gm.group_id
       WHERE pg.project_id = ? AND gm.student_id IN (?, ?)`,
      [projectId, student_a_id, student_b_id],
    );

    if (memberRows.length !== 2) {
      return res
        .status(400)
        .json({ message: "Both students must be in this project" });
    }

    const studentA = memberRows.find((r) => r.student_id === student_a_id);
    const studentB = memberRows.find((r) => r.student_id === student_b_id);

    if (studentA.group_id === studentB.group_id) {
      return res
        .status(400)
        .json({ message: "Students are already in the same group" });
    }

    await connection.beginTransaction();

    await connection.execute(
      `UPDATE group_members SET group_id = ? WHERE student_id = ? AND group_id = ?`,
      [studentB.group_id, student_a_id, studentA.group_id],
    );

    await connection.execute(
      `UPDATE group_members SET group_id = ? WHERE student_id = ? AND group_id = ?`,
      [studentA.group_id, student_b_id, studentB.group_id],
    );

    await connection.commit();

    return res.status(200).json({ message: "Students swapped successfully" });
  } catch (error) {
    console.error("swapStudents error:", error);
    try {
      await connection.rollback();
    } catch {}
    return res.status(500).json({ message: "Failed to swap students" });
  } finally {
    connection.release();
  }
};

export const getMyGroup = async (req, res) => {
  const studentId = req.user.id;

  try {
    const [profileRows] = await db.execute(
      `SELECT semester_id FROM student_profiles WHERE student_id = ?`,
      [studentId],
    );

    if (profileRows.length === 0) {
      return res.status(403).json({ message: "Student profile not found" });
    }

    const { semester_id } = profileRows[0];

    const [rows] = await db.execute(
      `SELECT
        p.title AS project_title,
        p.description AS project_description,
        u_teacher.name AS teacher_name,
        pg.group_number,
        u.id AS member_id,
        u.name AS member_name
       FROM group_members gm
       JOIN project_groups pg ON pg.id = gm.group_id
       JOIN projects p ON p.id = pg.project_id
       JOIN users u_teacher ON u_teacher.id = p.teacher_id
       JOIN group_members gm2 ON gm2.group_id = pg.id
       JOIN users u ON u.id = gm2.student_id
       WHERE gm.student_id = ? AND p.semester_id = ?
       ORDER BY p.created_at DESC, u.name ASC`,
      [studentId, semester_id],
    );

    if (rows.length === 0) {
      return res.status(200).json([]);
    }

    const projectMap = new Map();
    for (const row of rows) {
      if (!projectMap.has(row.project_title)) {
        projectMap.set(row.project_title, {
          project_title: row.project_title,
          project_description: row.project_description,
          teacher_name: row.teacher_name,
          group_number: row.group_number,
          members: [],
        });
      }
      projectMap.get(row.project_title).members.push({
        id: row.member_id,
        name: row.member_name,
      });
    }

    return res.status(200).json(Array.from(projectMap.values()));
  } catch (error) {
    console.error("getMyGroup error:", error);
    return res.status(500).json({ message: "Failed to fetch your group" });
  }
};

export const deleteProject = async (req, res) => {
  const { id: projectId } = req.params;

  try {
    const [result] = await db.execute(
      `DELETE FROM projects WHERE id = ? AND teacher_id = ?`,
      [projectId, req.user.id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("deleteProject error:", error);
    return res.status(500).json({ message: "Failed to delete project" });
  }
};

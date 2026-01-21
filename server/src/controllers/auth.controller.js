import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db.js";

export const register = async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    semester_id,
    frontend_level,
    backend_level,
    mobile_level = 0,
    uiux_level = 0,
  } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!["STUDENT", "TEACHER"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  if (role === "STUDENT") {
    if (!semester_id || frontend_level == null || backend_level == null) {
      return res
        .status(400)
        .json({ message: "Missing student profile fields" });
    }
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [existing] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );

    if (existing.length > 0) {
      await connection.rollback();
      return res.status(409).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [userResult] = await connection.execute(
      `
      INSERT INTO users (name, email, password_hash, role)
      VALUES (?, ?, ?, ?)
      `,
      [name, email, passwordHash, role],
    );

    const userId = userResult.insertId;

    if (role === "STUDENT") {
      await connection.execute(
        `
        INSERT INTO student_profiles
          (student_id, semester_id, frontend_level, backend_level, mobile_level, uiux_level)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          userId,
          semester_id,
          frontend_level,
          backend_level,
          mobile_level,
          uiux_level,
        ],
      );
    }

    await connection.commit();

    return res.status(201).json({
      message: `${role} registered successfully`,
      userId,
    });
  } catch (err) {
    await connection.rollback();
    console.error("Register error:", err);
    return res.status(500).json({ message: "Something went wrong" });
  } finally {
    connection.release();
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const [users] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res.status(404).json({ message: "User does not exist" });
    }

    const user = users[0];

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: "Wrong email or password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    const { password_hash, ...safeUser } = user;

    return res
      .cookie("access_token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json(safeUser);
  } catch (err) {
    console.error("Login error:", err);
    return res
      .status(500)
      .json({ message: "Something went wrong during login" });
  }
};

export const logout = (req, res) => {
  res
    .clearCookie("access_token", {
      httpOnly: true,
      sameSite: "strict",
    })
    .status(200)
    .json({ message: "Logged out successfully" });
};

export const me = (req, res) => {
  res.json({
    id: req.user.id,
    role: req.user.role,
    loggedIn: true,
  });
};

import mysql from "mysql2/promise";

const runMigrations = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true,
  });

  console.log("✅ Connected to MySQL server");

  const dbName = process.env.DB_NAME || "edulytics";
  await connection.execute(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\`
     CHARACTER SET utf8mb4
     COLLATE utf8mb4_unicode_ci`
  );
  console.log(`✅ Database '${dbName}' ready`);

  await connection.changeUser({ database: dbName });

  const sql = `
  SET FOREIGN_KEY_CHECKS = 0;

  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('TEACHER','STUDENT') NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB;

  CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) UNIQUE,
    name VARCHAR(120) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB;

  CREATE TABLE IF NOT EXISTS semesters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    semester_no INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_course_sem (course_id, semester_no),
    CONSTRAINT fk_sem_course FOREIGN KEY (course_id)
      REFERENCES courses(id) ON DELETE CASCADE
  ) ENGINE=InnoDB;

  -- student profile (ONLY semester_id, not course_id)
  CREATE TABLE IF NOT EXISTS student_profiles (
    student_id INT PRIMARY KEY,
    semester_id INT NOT NULL,
    frontend_level TINYINT NOT NULL,
    backend_level TINYINT NOT NULL,
    mobile_level TINYINT NOT NULL DEFAULT 0,
    uiux_level TINYINT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_profile_student FOREIGN KEY (student_id)
      REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_profile_semester FOREIGN KEY (semester_id)
      REFERENCES semesters(id) ON DELETE RESTRICT,

    CONSTRAINT chk_frontend_level CHECK (frontend_level BETWEEN 0 AND 5),
    CONSTRAINT chk_backend_level CHECK (backend_level BETWEEN 0 AND 5),
    CONSTRAINT chk_mobile_level CHECK (mobile_level BETWEEN 0 AND 5),
    CONSTRAINT chk_uiux_level CHECK (uiux_level BETWEEN 0 AND 5)
  ) ENGINE=InnoDB;

  CREATE TABLE IF NOT EXISTS topics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    semester_id INT NOT NULL,
    teacher_id INT NOT NULL,
    name VARCHAR(120) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_topic (semester_id, teacher_id, name),

    CONSTRAINT fk_topic_teacher FOREIGN KEY (teacher_id)
      REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_topic_semester FOREIGN KEY (semester_id)
      REFERENCES semesters(id) ON DELETE CASCADE
  ) ENGINE=InnoDB;

  CREATE TABLE IF NOT EXISTS quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    semester_id INT NOT NULL,
    teacher_id INT NOT NULL,
    title VARCHAR(160) NOT NULL,
    description TEXT,
    time_limit_sec INT NOT NULL DEFAULT 600,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_quiz_semester FOREIGN KEY (semester_id)
      REFERENCES semesters(id) ON DELETE RESTRICT,
    CONSTRAINT fk_quiz_teacher FOREIGN KEY (teacher_id)
      REFERENCES users(id) ON DELETE RESTRICT
  ) ENGINE=InnoDB;

  CREATE TABLE IF NOT EXISTS quiz_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT NOT NULL,
    topic_id INT NOT NULL,
    question_text TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_qq_quiz FOREIGN KEY (quiz_id)
      REFERENCES quizzes(id) ON DELETE CASCADE,
    CONSTRAINT fk_qq_topic FOREIGN KEY (topic_id)
      REFERENCES topics(id) ON DELETE RESTRICT
  ) ENGINE=InnoDB;

  CREATE TABLE IF NOT EXISTS quiz_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_question_id INT NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_opt_question FOREIGN KEY (quiz_question_id)
      REFERENCES quiz_questions(id) ON DELETE CASCADE
  ) ENGINE=InnoDB;

  CREATE TABLE IF NOT EXISTS quiz_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT NOT NULL,
    student_id INT NOT NULL,
    attempt_no INT NOT NULL DEFAULT 1,
    attempted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_score INT NULL,

    UNIQUE KEY uq_attempt (quiz_id, student_id, attempt_no),

    CONSTRAINT fk_attempt_quiz FOREIGN KEY (quiz_id)
      REFERENCES quizzes(id) ON DELETE CASCADE,
    CONSTRAINT fk_attempt_student FOREIGN KEY (student_id)
      REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB;

  CREATE TABLE IF NOT EXISTS quiz_question_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_attempt_id INT NOT NULL,
    quiz_question_id INT NOT NULL,
    topic_id INT NOT NULL,
    selected_option_id INT NULL,
    is_correct BOOLEAN NOT NULL,
    answered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    KEY idx_qqa_attempt (quiz_attempt_id),
    KEY idx_qqa_topic_time (topic_id, answered_at),

    CONSTRAINT fk_qqa_attempt FOREIGN KEY (quiz_attempt_id)
      REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    CONSTRAINT fk_qqa_question FOREIGN KEY (quiz_question_id)
      REFERENCES quiz_questions(id) ON DELETE CASCADE,
    CONSTRAINT fk_qqa_topic FOREIGN KEY (topic_id)
      REFERENCES topics(id) ON DELETE RESTRICT,
    CONSTRAINT fk_qqa_selected_option FOREIGN KEY (selected_option_id)
      REFERENCES quiz_options(id) ON DELETE SET NULL
  ) ENGINE=InnoDB;

  CREATE TABLE IF NOT EXISTS bkt_topic_params (
    topic_id INT PRIMARY KEY,
    p_l0 DECIMAL(6,5) NOT NULL,
    p_t  DECIMAL(6,5) NOT NULL,
    p_s  DECIMAL(6,5) NOT NULL,
    p_g  DECIMAL(6,5) NOT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_bkt_topic FOREIGN KEY (topic_id)
      REFERENCES topics(id) ON DELETE CASCADE
  ) ENGINE=InnoDB;

  CREATE TABLE IF NOT EXISTS student_topic_mastery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    topic_id INT NOT NULL,
    p_know DECIMAL(6,5) NOT NULL,
    attempt_count INT NOT NULL DEFAULT 0,
    last_updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_mastery (student_id, topic_id),
    KEY idx_mastery_topic (topic_id),

    CONSTRAINT fk_mastery_student FOREIGN KEY (student_id)
      REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_mastery_topic FOREIGN KEY (topic_id)
      REFERENCES topics(id) ON DELETE CASCADE
  ) ENGINE=InnoDB;

  CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    course_id INT NOT NULL,
    semester_id INT NOT NULL,
    title VARCHAR(160) NOT NULL,
    description TEXT,
    group_size INT NOT NULL,
    use_quiz_balance BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_proj_teacher FOREIGN KEY (teacher_id)
      REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_proj_course FOREIGN KEY (course_id)
      REFERENCES courses(id) ON DELETE RESTRICT,
    CONSTRAINT fk_proj_semester FOREIGN KEY (semester_id)
      REFERENCES semesters(id) ON DELETE RESTRICT
  ) ENGINE=InnoDB;

  CREATE TABLE IF NOT EXISTS groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    group_number INT NOT NULL,

    UNIQUE KEY uq_group (project_id, group_number),

    CONSTRAINT fk_group_project FOREIGN KEY (project_id)
      REFERENCES projects(id) ON DELETE CASCADE
  ) ENGINE=InnoDB;

  CREATE TABLE IF NOT EXISTS group_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    student_id INT NOT NULL,

    UNIQUE KEY uq_group_member (group_id, student_id),

    CONSTRAINT fk_gm_group FOREIGN KEY (group_id)
      REFERENCES groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_gm_student FOREIGN KEY (student_id)
      REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB;

  SET FOREIGN_KEY_CHECKS = 1;
  `;

  await connection.query(sql);

  console.log("✅ Tables created / verified");
  await connection.end();
  console.log("🔌 Database setup complete!");
};

runMigrations().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});

export default runMigrations;

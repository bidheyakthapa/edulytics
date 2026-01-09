import mysql from "mysql2/promise";

const seedAcademics = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "edulytics",
  });

  console.log("🌱 Seeding courses and semesters...");

  const courses = [
    { code: "BCA", name: "Bachelor of Computer Applications" },
    { code: "CSIT", name: "Computer Science and Information Technology" },
  ];

  for (const course of courses) {
    await connection.execute(
      `
      INSERT INTO courses (code, name)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE name = VALUES(name)
      `,
      [course.code, course.name]
    );
  }

  const [courseRows] = await connection.execute(
    `SELECT id, code FROM courses WHERE code IN ('BCA', 'CSIT')`
  );

  for (const course of courseRows) {
    for (let sem = 1; sem <= 8; sem++) {
      await connection.execute(
        `
        INSERT INTO semesters (course_id, semester_no)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE semester_no = semester_no
        `,
        [course.id, sem]
      );
    }
  }

  console.log("✅ Courses and semesters seeded successfully!");
  await connection.end();
};

seedAcademics().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});

export default seedAcademics;

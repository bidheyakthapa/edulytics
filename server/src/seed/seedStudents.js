import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const students = [
  "Bibek B.K.",
  "Jaya Khanal",
  "Naina Lakhe",
  "Bidheyak Thapa",
  "Rasna Suwal",
  "Niruta Shrestha",
  "Manish Gautam",
  "Unique Shilpakar",
  "Chandan Chaudhary",
  "Manjish Chaulagain",
  "Salina Pulami",
  "Suvekshya Pradhan",
  "Sanju Nagarkoti",
  "Semika Khadka",
  "Ganesh Budhathoki",
  "Aayushman Raj Luitel",
  "Utsab Shrestha",
  "Anil Prajapati",
  "Rockey Kusatha",
  "Suraj Chandra Shrestha",
  "Anmol Tamang",
  "Sumit Madhikarmi",
  "Rupesh Khadka",
  "Rohan Lakhemaru",
  "Suresh Shrestha",
  "Saurav Gautam",
  "Sewak Raj Joshi",
  "Sanjay Chaudhary",
  "Ayush Yakami",
  "Kumar Raut",
  "Rohit Dangol",
  "Sameer Baiju",
];

// firstname@gmail.com — take first word, lowercase, strip dots
function toEmail(name) {
  const first = name.split(" ")[0].toLowerCase().replace(/\./g, "");
  return `${first}@gmail.com`;
}

function randomSkill() {
  return Math.floor(Math.random() * 6); // 0-5
}

const seedStudents = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "edulytics",
  });

  console.log("🌱 Seeding students...");

  const SEMESTER_ID = 6;
  const PASSWORD = "bidheyak";
  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  let inserted = 0;
  let skipped = 0;

  for (const name of students) {
    const email = toEmail(name);

    // check if already exists
    const [existing] = await connection.execute(
      `SELECT id FROM users WHERE email = ?`,
      [email],
    );

    if (existing.length > 0) {
      console.log(`⏭️  Skipping ${name} — email already exists`);
      skipped++;
      continue;
    }

    const [userResult] = await connection.execute(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES (?, ?, ?, 'STUDENT')`,
      [name, email, passwordHash],
    );

    const userId = userResult.insertId;

    await connection.execute(
      `INSERT INTO student_profiles
        (student_id, semester_id, frontend_level, backend_level, mobile_level, uiux_level)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        SEMESTER_ID,
        randomSkill(),
        randomSkill(),
        randomSkill(),
        randomSkill(),
      ],
    );

    console.log(`✅ ${name} → ${email}`);
    inserted++;
  }

  console.log(`\n🎉 Done! ${inserted} inserted, ${skipped} skipped.`);
  await connection.end();
};

seedStudents().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});

export default seedStudents;

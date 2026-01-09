import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import db from "./db.js";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser());

const PORT = process.env.PORT || 8080;

const connectToDB = async () => {
  try {
    const connection = await db.getConnection();
    connection.release();
    console.log("✅ Connected to the database successfully!");
  } catch (error) {
    console.error("❌ Failed to connect to the database:", error.message);
    process.exit(1);
  }
};

connectToDB().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server listening on port ${PORT}`);
  });
});

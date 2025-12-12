// backend/server.js
import express from "express";
import cors from "cors";
import pkg from "pg";

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.post("/add-comment", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim())
      return res.json({ error: "Empty comment" });

    await db.query(
      "INSERT INTO comments (message) VALUES ($1)",
      [message]
    );

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Backend running on port " + PORT));

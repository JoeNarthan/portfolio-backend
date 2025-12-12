// server.js (ES Module Version)

// 1. CRITICAL FIX: Use 'import' instead of 'require'
import express from "express";
import cors from "cors";
import pkg from "pg";

// When importing an entire package in ESM, we access its named exports like this.
const { Pool } = pkg; 

const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

// 2. Database Connection Setup (The SSL issue may still be present later)
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});
// --- API Endpoints ---

// Health Check Endpoint (For Deployment Readiness Probes)
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'Server Running', 
    service: 'Comment API'
  });
});

// Endpoint to add a new comment
app.post("/add-comment", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ error: "Comment message cannot be empty" });
    }

    await db.query("INSERT INTO comments (message) VALUES ($1)", [message]);
    res.status(201).json({ success: true, message: "Comment added successfully" });
  } catch (err) {
    console.error("Error adding comment:", err.message);
    res.status(500).json({ error: "Failed to add comment", details: err.message });
  }
});

// Endpoint to get all comments
app.get("/comments", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM comments ORDER BY id DESC");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching comments:", err.message);
    res.status(500).json({ error: "Failed to retrieve comments", details: err.message });
  }
});


// 3. Server Listener
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
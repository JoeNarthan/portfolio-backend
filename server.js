// server.js (FINAL FIXED CODE)
import express from "express";
import cors from "cors";
import pkg from "pg";

const { Pool } = pkg; 

const app = express();

app.use(cors());
app.use(express.json());

// 1. FIXED: Removed 'ssl' block completely. 
// This prepares the app to use the 'sslmode=disable' fix in the URL (Step 2).
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// --- API Endpoints ---

// Health Check Endpoint (For Railway Readiness)
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
    console.error("Database Query Error:", err.message);
    // The ECONNRESET error will be caught here.
    res.status(500).json({ 
      error: "Failed to add comment", 
      details: "Database Connection Error. Check Railway URL format.",
      internal_error: err.message
    });
  }
});

// Endpoint to get all comments
app.get("/comments", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM comments ORDER BY id DESC");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Database Query Error:", err.message);
    res.status(500).json({ 
      error: "Failed to retrieve comments", 
      details: "Database Connection Error. Check Railway URL format.",
      internal_error: err.message 
    });
  }
});


// 2. FIXED: Uses 0.0.0.0 and process.env.PORT
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
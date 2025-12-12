// server.js

// 1. Fix: Using CommonJS 'require' for broader compatibility (unless your package.json specifies "type": "module")
const express = require("express");
const cors = require("cors");
const pkg = require("pg"); // Using 'pkg' as the alias for the 'pg' module

const { Pool } = pkg;

const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

// 2. Database Connection Setup
// NOTE: If you get a 'self-signed certificate' error, change 'rejectUnauthorized: true' to 'rejectUnauthorized: false'
// for development, or add the 'ca' property with your database's root certificate for production.
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: true, 
    // ca: fs.readFileSync('/path/to/your/root.crt').toString(), // Uncomment and set path for secure cloud connections
  }
});

// --- API Endpoints ---

// 3. Health Check Endpoint (Crucial to prevent SIGTERM in deployments)
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'Server Running', 
    service: 'Comment API',
    database_check: 'Pending on API call' 
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
    // Note: Database connection errors usually hit here first
    res.status(500).json({ error: "Failed to retrieve comments", details: err.message });
  }
});


// 4. Server Listener
// Using process.env.PORT for deployment flexibility, falling back to 3000
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
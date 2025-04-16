const mysql = require("mysql2");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const app = express();

// Enable CORS and JSON parsing
app.use(
  cors({
    origin: "http://localhost:8081",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use(express.json());

// Session configuration
app.use(
  session({
    secret: "your-secret-key", // Change this to a secure secret in production
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);

// Initialize passport and session
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const query = "SELECT * FROM users WHERE email = ?";
        pool.query(query, [email], async (error, results) => {
          if (error) {
            return done(error);
          }
          if (results.length === 0) {
            return done(null, false, {
              message: "Incorrect email or password",
            });
          }

          const user = results[0];
          const isValid = await bcrypt.compare(password, user.hash);

          if (!isValid) {
            return done(null, false, {
              message: "Incorrect email or password",
            });
          }

          return done(null, user);
        });
      } catch (error) {
        return done(error);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

passport.deserializeUser((id, done) => {
  const query = "SELECT * FROM users WHERE user_id = ?";
  pool.query(query, [id], (error, results) => {
    if (error) {
      return done(error);
    }
    done(null, results[0]);
  });
});

// Middleware for logging all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Create a connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "1204",
  database: "divvy",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Connection failed:", err);
  } else {
    console.log("Successfully connected to MySQL!");
    connection.release(); // Release the connection when done testing
  }
});

// Simple test endpoint
app.get("/test", (req, res) => {
  res.json({ message: "API is working!" });
});

// API endpoint to check database structure
app.get("/api/db-info", (req, res) => {
  pool.query("DESCRIBE users", (error, results) => {
    if (error) {
      return res
        .status(500)
        .json({ error: "Database error", details: error.message });
    }
    res.json({ tableStructure: results });
  });
});

// API endpoint to get all users
app.get("/api/users", (req, res) => {
  console.log("Request received for all users");

  const query = `
    SELECT 
        user_id as id, 
        CONCAT(first_name, ' ', last_name) as name, 
        email
    FROM users
    `;

  pool.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching users:", error);
      return res
        .status(500)
        .json({ error: "Database error", details: error.message });
    }

    console.log("All users results:", results);
    res.json(results);
  });
});

// API endpoint to search users
app.get("/api/users/search", (req, res) => {
  console.log("Search request received with term:", req.query.term);
  const searchTerm = req.query.term || "";

  const query = `
    SELECT 
        user_id as id, 
        CONCAT(first_name, ' ', last_name) as name, 
        email
    FROM users
    WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ?
    `;

  const searchPattern = `%${searchTerm}%`;

  pool.query(
    query,
    [searchPattern, searchPattern, searchPattern],
    (error, results) => {
      if (error) {
        console.error("Error searching users:", error);
        return res
          .status(500)
          .json({ error: "Database error", details: error.message });
      }

      console.log("Search results:", results);
      res.json(results);
    },
  );
});

// API endpoint to get a single user by ID
app.get("/api/users/:id", (req, res) => {
  const userId = req.params.id;

  const query = `
    SELECT 
        user_id as id, 
        first_name, 
        last_name,
        CONCAT(first_name, ' ', last_name) as name, 
        email,
        phone
    FROM users
    WHERE user_id = ?
    `;

  pool.query(query, [userId], (error, results) => {
    if (error) {
      console.error("Error fetching user:", error);
      return res
        .status(500)
        .json({ error: "Database error", details: error.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(results[0]);
  });
});

// API endpoint to add a new user
app.post("/api/users", (req, res) => {
  const { first_name, last_name, email, phone, hash, stripe_id } = req.body;

  // Basic validation
  if (!first_name || !last_name || !email || !hash || !stripe_id) {
    return res.status(400).json({
      error: "Missing required fields",
      requiredFields: ["first_name", "last_name", "email", "hash", "stripe_id"],
    });
  }

  const query = `
    INSERT INTO users (first_name, last_name, email, phone, hash, stripe_id) 
    VALUES (?, ?, ?, ?, ?, ?)
    `;

  pool.query(
    query,
    [first_name, last_name, email, phone || null, hash, stripe_id],
    (error, results) => {
      if (error) {
        console.error("Error creating user:", error);

        // Check for duplicate email
        if (error.code === "ER_DUP_ENTRY") {
          return res.status(409).json({ error: "Email already exists" });
        }

        return res
          .status(500)
          .json({ error: "Database error", details: error.message });
      }

      res.status(201).json({
        message: "User created successfully",
        id: results.insertId,
      });
    },
  );
});

// API endpoint to update a user
app.put("/api/users/:id", (req, res) => {
  const userId = req.params.id;
  const { first_name, last_name, email, phone } = req.body;

  // Build dynamic SET clause for SQL
  const updates = [];
  const values = [];

  if (first_name) {
    updates.push("first_name = ?");
    values.push(first_name);
  }

  if (last_name) {
    updates.push("last_name = ?");
    values.push(last_name);
  }

  if (email) {
    updates.push("email = ?");
    values.push(email);
  }

  if (phone !== undefined) {
    updates.push("phone = ?");
    values.push(phone);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: "No update fields provided" });
  }

  // Add user_id to values array
  values.push(userId);

  const query = `
    UPDATE users 
    SET ${updates.join(", ")} 
    WHERE user_id = ?
    `;

  pool.query(query, values, (error, results) => {
    if (error) {
      console.error("Error updating user:", error);

      // Check for duplicate email
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "Email already exists" });
      }

      return res
        .status(500)
        .json({ error: "Database error", details: error.message });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User updated successfully" });
  });
});

// API endpoint to delete a user
app.delete("/api/users/:id", (req, res) => {
  const userId = req.params.id;

  const query = `DELETE FROM users WHERE user_id = ?`;

  pool.query(query, [userId], (error, results) => {
    if (error) {
      console.error("Error deleting user:", error);
      return res
        .status(500)
        .json({ error: "Database error", details: error.message });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  });
});

// API endpoint to get logs
app.get("/api/logs", (req, res) => {
  const limit = parseInt(req.query.limit) || 100;

  const query = `
    SELECT * FROM log
    ORDER BY log_time DESC
    LIMIT ?
    `;

  pool.query(query, [limit], (error, results) => {
    if (error) {
      console.error("Error fetching logs:", error);
      return res
        .status(500)
        .json({ error: "Database error", details: error.message });
    }

    res.json(results);
  });
});

// API endpoint to add a log entry
app.post("/api/logs", (req, res) => {
  const { tag, message, issuer_id, issuerState, ip, verbosity } = req.body;

  if (
    !tag ||
    !message ||
    issuerState === undefined ||
    !ip ||
    verbosity === undefined
  ) {
    return res.status(400).json({
      error: "Missing required fields",
      requiredFields: ["tag", "message", "issuerState", "ip", "verbosity"],
    });
  }

  const query = `
    INSERT INTO log (tag, log_time, message, issuer_id, issuerState, ip, verbosity)
    VALUES (?, NOW(), ?, ?, ?, ?, ?)
    `;

  pool.query(
    query,
    [tag, message, issuer_id || null, issuerState, ip, verbosity],
    (error, results) => {
      if (error) {
        console.error("Error creating log entry:", error);
        return res
          .status(500)
          .json({ error: "Database error", details: error.message });
      }

      res.status(201).json({
        message: "Log entry created successfully",
        id: results.insertId,
      });
    },
  );
});

// Registration endpoint
app.post("/api/register", async (req, res) => {
  const { email, password, first_name, last_name, phone } = req.body;

  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({
      error: "Missing required fields",
      requiredFields: ["email", "password", "first_name", "last_name"],
    });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users (email, hash, first_name, last_name, phone, stripe_id) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    pool.query(
      query,
      [email, hash, first_name, last_name, phone || null, ""],
      (error, results) => {
        if (error) {
          if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ error: "Email already exists" });
          }
          return res
            .status(500)
            .json({ error: "Database error", details: error.message });
        }

        res.status(201).json({
          message: "User created successfully",
          id: results.insertId,
        });
      },
    );
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// Login endpoint
app.post("/api/login", passport.authenticate("local"), (req, res) => {
  res.json({
    message: "Login successful",
    user: {
      id: req.user.user_id,
      email: req.user.email,
      name: `${req.user.first_name} ${req.user.last_name}`,
    },
  });
});

// Logout endpoint
app.post("/api/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Error during logout" });
    }
    res.json({ message: "Logout successful" });
  });
});

// Protected route example
app.get("/api/me", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  res.json({
    id: req.user.user_id,
    email: req.user.email,
    name: `${req.user.first_name} ${req.user.last_name}`,
  });
});

const port = 8080;
app.listen(port, () => {
  console.log(`Test server running at http://localhost:${port}`);
});

module.exports = app;

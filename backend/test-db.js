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
    origin: ["http://localhost:8080", "http://localhost:8081"],
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
  password: "Mkilop12!",
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

// API endpoint to create a new group
app.post("/api/groups", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { title, memberEmails } = req.body;

  if (!title || !memberEmails || !Array.isArray(memberEmails)) {
    return res.status(400).json({
      error: "Missing required fields",
      requiredFields: ["title", "memberEmails"],
    });
  }

  // Start a transaction
  pool.getConnection((err, connection) => {
    if (err) {
      return res.status(500).json({ error: "Database error", details: err.message });
    }

    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        return res.status(500).json({ error: "Database error", details: err.message });
      }

      // Insert the group
      const createGroupQuery = "INSERT INTO divvy_groups (title, created_by) VALUES (?, ?)";
      connection.query(createGroupQuery, [title, req.user.user_id], (error, results) => {
        if (error) {
          return connection.rollback(() => {
            connection.release();
            res.status(500).json({ error: "Database error", details: error.message });
          });
        }

        const groupId = results.insertId;

        // Get user IDs for all member emails
        const placeholders = memberEmails.map(() => '?').join(',');
        const getUsersQuery = `SELECT user_id FROM users WHERE email IN (${placeholders})`;
        connection.query(getUsersQuery, memberEmails, (error, results) => {
          if (error) {
            return connection.rollback(() => {
              connection.release();
              res.status(500).json({ error: "Database error", details: error.message });
            });
          }

          const memberIds = results.map(row => row.user_id);
          
          // Insert group members (including the creator)
          const memberValues = [[groupId, req.user.user_id]]; // Add creator as member
          memberIds.forEach(userId => {
            if (userId !== req.user.user_id) { // Don't add creator twice
              memberValues.push([groupId, userId]);
            }
          });

          const addMembersQuery = "INSERT INTO divvy_group_members (group_id, user_id) VALUES ?";
          connection.query(addMembersQuery, [memberValues], (error) => {
            if (error) {
              return connection.rollback(() => {
                connection.release();
                res.status(500).json({ error: "Database error", details: error.message });
              });
            }

            connection.commit((err) => {
              if (err) {
                return connection.rollback(() => {
                  connection.release();
                  res.status(500).json({ error: "Database error", details: err.message });
                });
              }

              connection.release();
              res.status(201).json({
                message: "Group created successfully",
                groupId: groupId,
              });
            });
          });
        });
      });
    });
  });
});

// API endpoint to get user's groups
app.get("/api/groups", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const query = `
    SELECT 
      g.group_id as id,
      g.title,
      g.created_at,
      COUNT(DISTINCT gm.user_id) as member_count,
      GROUP_CONCAT(DISTINCT CONCAT(u.first_name, ' ', u.last_name) SEPARATOR ', ') as members
    FROM divvy_groups g
    JOIN divvy_group_members gm ON g.group_id = gm.group_id
    JOIN users u ON gm.user_id = u.user_id
    WHERE g.group_id IN (
      SELECT group_id 
      FROM divvy_group_members 
      WHERE user_id = ?
    )
    GROUP BY g.group_id
    ORDER BY g.created_at DESC
  `;

  pool.query(query, [req.user.user_id], (error, results) => {
    if (error) {
      console.error("Error fetching groups:", error);
      return res.status(500).json({ error: "Database error", details: error.message });
    }

    res.json(results);
  });
});

// API endpoint to get group details
app.get("/api/groups/:id", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const groupId = req.params.id;

  // First check if user is a member of the group
  const checkMembershipQuery = "SELECT 1 FROM divvy_group_members WHERE group_id = ? AND user_id = ?";
  pool.query(checkMembershipQuery, [groupId, req.user.user_id], (error, results) => {
    if (error) {
      return res.status(500).json({ error: "Database error", details: error.message });
    }

    if (results.length === 0) {
      return res.status(403).json({ error: "Not a member of this group" });
    }

    // Get group details and members
    const query = `
      SELECT 
        g.group_id as id,
        g.title,
        g.created_at,
        u.user_id,
        CONCAT(u.first_name, ' ', u.last_name) as name,
        u.email
      FROM divvy_groups g
      JOIN divvy_group_members gm ON g.group_id = gm.group_id
      JOIN users u ON gm.user_id = u.user_id
      WHERE g.group_id = ?
    `;

    pool.query(query, [groupId], (error, results) => {
      if (error) {
        console.error("Error fetching group details:", error);
        return res.status(500).json({ error: "Database error", details: error.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Group not found" });
      }

      // Format the response
      const groupDetails = {
        id: results[0].id,
        title: results[0].title,
        created_at: results[0].created_at,
        members: results.map(row => ({
          id: row.user_id,
          name: row.name,
          email: row.email
        }))
      };

      res.json(groupDetails);
    });
  });
});

// API endpoint to delete a group
app.delete("/api/groups/:id", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const groupId = req.params.id;

  // Check if user is the creator of the group
  const checkCreatorQuery = "SELECT 1 FROM divvy_groups WHERE group_id = ? AND created_by = ?";
  pool.query(checkCreatorQuery, [groupId, req.user.user_id], (error, results) => {
    if (error) {
      return res.status(500).json({ error: "Database error", details: error.message });
    }

    if (results.length === 0) {
      return res.status(403).json({ error: "Only the group creator can delete the group" });
    }

    // Delete the group (cascade will handle group_members)
    const deleteQuery = "DELETE FROM divvy_groups WHERE group_id = ?";
    pool.query(deleteQuery, [groupId], (error, results) => {
      if (error) {
        console.error("Error deleting group:", error);
        return res.status(500).json({ error: "Database error", details: error.message });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Group not found" });
      }

      res.json({ message: "Group deleted successfully" });
    });
  });
});

// API endpoint to add members to a group
app.post("/api/groups/:id/members", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const groupId = req.params.id;
  const { memberEmails } = req.body;

  if (!memberEmails || !Array.isArray(memberEmails)) {
    return res.status(400).json({
      error: "Missing required fields",
      requiredFields: ["memberEmails"],
    });
  }

  // First check if user is the creator of the group
  const checkCreatorQuery = "SELECT 1 FROM divvy_groups WHERE group_id = ? AND created_by = ?";
  pool.query(checkCreatorQuery, [groupId, req.user.user_id], (error, results) => {
    if (error) {
      return res.status(500).json({ error: "Database error", details: error.message });
    }

    if (results.length === 0) {
      return res.status(403).json({ error: "Only the group creator can add members" });
    }

    // Get user IDs for all member emails
    const getUsersQuery = "SELECT user_id FROM users WHERE email IN (?)";
    pool.query(getUsersQuery, [memberEmails], (error, results) => {
      if (error) {
        return res.status(500).json({ error: "Database error", details: error.message });
      }

      const memberIds = results.map(row => row.user_id);
      
      // Check if any of these users are already members
      const checkExistingQuery = "SELECT user_id FROM divvy_group_members WHERE group_id = ? AND user_id IN (?)";
      pool.query(checkExistingQuery, [groupId, memberIds], (error, results) => {
        if (error) {
          return res.status(500).json({ error: "Database error", details: error.message });
        }

        const existingMemberIds = results.map(row => row.user_id);
        const newMemberIds = memberIds.filter(id => !existingMemberIds.includes(id));

        if (newMemberIds.length === 0) {
          return res.status(400).json({ error: "All users are already members of this group" });
        }

        // Insert new members
        const memberValues = newMemberIds.map(userId => [groupId, userId]);
        const addMembersQuery = "INSERT INTO divvy_group_members (group_id, user_id) VALUES ?";
        pool.query(addMembersQuery, [memberValues], (error) => {
          if (error) {
            return res.status(500).json({ error: "Database error", details: error.message });
          }

          res.status(201).json({
            message: "Members added successfully",
            addedCount: newMemberIds.length
          });
        });
      });
    });
  });
});

// API endpoint to create a new expense
app.post("/api/groups/:groupId/expenses", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const groupId = req.params.groupId;
  const { title, total_amount, description, split_type, splits } = req.body;

  if (!title || !total_amount || !split_type || !splits) {
    return res.status(400).json({
      error: "Missing required fields",
      requiredFields: ["title", "total_amount", "split_type", "splits"],
    });
  }

  // Start a transaction
  pool.getConnection((err, connection) => {
    if (err) {
      return res.status(500).json({ error: "Database error", details: err.message });
    }

    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        return res.status(500).json({ error: "Database error", details: err.message });
      }

      // Insert the expense
      const createExpenseQuery = `
        INSERT INTO expenses (group_id, title, total_amount, description, created_by)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      connection.query(
        createExpenseQuery,
        [groupId, title, total_amount, description || null, req.user.user_id],
        (error, results) => {
          if (error) {
            return connection.rollback(() => {
              connection.release();
              res.status(500).json({ error: "Database error", details: error.message });
            });
          }

          const expenseId = results.insertId;

          // Create expense splits
          const splitValues = splits.map(split => [
            expenseId,
            split.user_id,
            split.amount,
            split.percentage
          ]);

          const createSplitsQuery = `
            INSERT INTO expense_splits (expense_id, user_id, amount, percentage)
            VALUES ?
          `;

          connection.query(createSplitsQuery, [splitValues], (error) => {
            if (error) {
              return connection.rollback(() => {
                connection.release();
                res.status(500).json({ error: "Database error", details: error.message });
              });
            }

            connection.commit((err) => {
              if (err) {
                return connection.rollback(() => {
                  connection.release();
                  res.status(500).json({ error: "Database error", details: err.message });
                });
              }

              connection.release();
              res.status(201).json({
                message: "Expense created successfully",
                expenseId: expenseId,
              });
            });
          });
        }
      );
    });
  });
});

// API endpoint to get all expenses for a group
app.get("/api/groups/:groupId/expenses", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const groupId = req.params.groupId;

  const query = `
    SELECT 
      e.expense_id,
      e.title,
      e.total_amount,
      e.description,
      e.is_settled,
      e.is_active,
      e.is_paid,
      e.created_at,
      e.created_by,
      CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
      GROUP_CONCAT(
        JSON_OBJECT(
          'split_id', es.split_id,
          'user_id', es.user_id,
          'amount', es.amount,
          'percentage', es.percentage,
          'is_accepted', es.is_accepted,
          'is_paid', es.is_paid,
          'user_name', CONCAT(u2.first_name, ' ', u2.last_name)
        )
      ) as splits
    FROM expenses e
    JOIN users u ON e.created_by = u.user_id
    JOIN expense_splits es ON e.expense_id = es.expense_id
    JOIN users u2 ON es.user_id = u2.user_id
    WHERE e.group_id = ?
    GROUP BY e.expense_id
    ORDER BY e.created_at DESC
  `;

  pool.query(query, [groupId], (error, results) => {
    if (error) {
      console.error("Error fetching expenses:", error);
      return res.status(500).json({ error: "Database error", details: error.message });
    }

    // Parse the JSON strings in the splits column
    const formattedResults = results.map(row => ({
      ...row,
      splits: row.splits ? row.splits.split(',').map(split => JSON.parse(split)) : []
    }));

    res.json(formattedResults);
  });
});

// API endpoint to update expense split status
app.put("/api/expenses/:expenseId/splits/:splitId", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { expenseId, splitId } = req.params;
  const { is_accepted, is_paid } = req.body;

  const query = `
    UPDATE expense_splits 
    SET is_accepted = ?, is_paid = ?
    WHERE split_id = ? AND expense_id = ? AND user_id = ?
  `;

  pool.query(
    query,
    [is_accepted, is_paid, splitId, expenseId, req.user.user_id],
    (error, results) => {
      if (error) {
        console.error("Error updating expense split:", error);
        return res.status(500).json({ error: "Database error", details: error.message });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Expense split not found or unauthorized" });
      }

      res.json({ message: "Expense split updated successfully" });
    }
  );
});

// API endpoint to delete an expense
app.delete("/api/expenses/:expenseId", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const expenseId = req.params.expenseId;

  // Check if user is the creator of the expense
  const checkCreatorQuery = "SELECT 1 FROM expenses WHERE expense_id = ? AND created_by = ?";
  pool.query(checkCreatorQuery, [expenseId, req.user.user_id], (error, results) => {
    if (error) {
      return res.status(500).json({ error: "Database error", details: error.message });
    }

    if (results.length === 0) {
      return res.status(403).json({ error: "Only the expense creator can delete the expense" });
    }

    // Delete the expense (cascade will handle expense_splits)
    const deleteQuery = "DELETE FROM expenses WHERE expense_id = ?";
    pool.query(deleteQuery, [expenseId], (error, results) => {
      if (error) {
        console.error("Error deleting expense:", error);
        return res.status(500).json({ error: "Database error", details: error.message });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Expense not found" });
      }

      res.json({ message: "Expense deleted successfully" });
    });
  });
});

// API endpoint to get all expenses for a user
app.get("/api/expenses", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const query = `
    SELECT 
      e.expense_id,
      e.title,
      e.total_amount,
      e.description,
      e.is_settled,
      e.is_active,
      e.is_paid,
      e.created_at,
      e.created_by,
      g.title as group_title,
      CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
      GROUP_CONCAT(
        JSON_OBJECT(
          'split_id', es.split_id,
          'user_id', es.user_id,
          'amount', es.amount,
          'percentage', es.percentage,
          'is_accepted', es.is_accepted,
          'is_paid', es.is_paid,
          'user_name', CONCAT(u2.first_name, ' ', u2.last_name)
        )
      ) as splits
    FROM expenses e
    JOIN divvy_groups g ON e.group_id = g.group_id
    JOIN users u ON e.created_by = u.user_id
    JOIN expense_splits es ON e.expense_id = es.expense_id
    JOIN users u2 ON es.user_id = u2.user_id
    WHERE es.user_id = ?
    GROUP BY e.expense_id
    ORDER BY e.created_at DESC
  `;

  pool.query(query, [req.user.user_id], (error, results) => {
    if (error) {
      console.error("Error fetching expenses:", error);
      return res.status(500).json({ error: "Database error", details: error.message });
    }

    // Parse the JSON strings in the splits column
    const formattedResults = results.map(row => ({
      ...row,
      splits: row.splits ? row.splits.split(',').map(split => JSON.parse(split)) : []
    }));

    res.json(formattedResults);
  });
});

const port = 8080;
app.listen(port, () => {
  console.log(`Test server running at http://localhost:${port}`);
});

module.exports = app;

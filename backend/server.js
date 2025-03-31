const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Mkilop12!",
  database: "divvy",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});

app.post("/signup", async (req, res) => {
  const { email, password, first_name, last_name, phone } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const hash = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (email, hash, first_name, last_name, phone, stripe_id) VALUES (?, ?, ?, ?, ?, ?)",
    [email, hash, first_name, last_name, phone, ""],
    (err, result) => {
      if (err) {
        console.error("Error inserting user:", err); // Log the error
        return res.status(500).json({ message: "Error inserting user" });
      }
      res.status(201).json({ message: "User created successfully" });
    },
  );
});

app.listen(3000, () => console.log("Server running on port 3000"));

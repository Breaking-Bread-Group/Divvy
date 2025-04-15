const mysql = require('mysql2');
const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS and JSON parsing
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Middleware for logging all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Create a connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Arriaiscute100#',
    database: 'divvy',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
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
app.get('/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

// API endpoint to check database structure
app.get('/api/db-info', (req, res) => {
    pool.query('DESCRIBE users', (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database error', details: error.message });
        }
        res.json({ tableStructure: results });
    });
});

// API endpoint to get all users
app.get('/api/users', (req, res) => {
    console.log('Request received for all users');
    
    const query = `
    SELECT 
        user_id as id, 
        CONCAT(first_name, ' ', last_name) as name, 
        email
    FROM users
    `;
    
    pool.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching users:', error);
            return res.status(500).json({ error: 'Database error', details: error.message });
        }
        
        console.log('All users results:', results);
        res.json(results);
    });
});

// API endpoint to search users
app.get('/api/users/search', (req, res) => {
    console.log('Search request received with term:', req.query.term);
    const searchTerm = req.query.term || '';
    
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
                console.error('Error searching users:', error);
                return res.status(500).json({ error: 'Database error', details: error.message });
            }
            
            console.log('Search results:', results);
            res.json(results);
        }
    );
});

// API endpoint to get a single user by ID
app.get('/api/users/:id', (req, res) => {
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
            console.error('Error fetching user:', error);
            return res.status(500).json({ error: 'Database error', details: error.message });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(results[0]);
    });
});

// API endpoint to add a new user
app.post('/api/users', (req, res) => {
    const { first_name, last_name, email, phone, hash, stripe_id } = req.body;
    
    // Basic validation
    if (!first_name || !last_name || !email || !hash || !stripe_id) {
        return res.status(400).json({ 
            error: 'Missing required fields', 
            requiredFields: ['first_name', 'last_name', 'email', 'hash', 'stripe_id'] 
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
                console.error('Error creating user:', error);
                
                // Check for duplicate email
                if (error.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ error: 'Email already exists' });
                }
                
                return res.status(500).json({ error: 'Database error', details: error.message });
            }
            
            res.status(201).json({ 
                message: 'User created successfully', 
                id: results.insertId 
            });
        }
    );
});

// API endpoint to update a user
app.put('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    const { first_name, last_name, email, phone } = req.body;
    
    // Build dynamic SET clause for SQL
    const updates = [];
    const values = [];
    
    if (first_name) {
        updates.push('first_name = ?');
        values.push(first_name);
    }
    
    if (last_name) {
        updates.push('last_name = ?');
        values.push(last_name);
    }
    
    if (email) {
        updates.push('email = ?');
        values.push(email);
    }
    
    if (phone !== undefined) {
        updates.push('phone = ?');
        values.push(phone);
    }
    
    if (updates.length === 0) {
        return res.status(400).json({ error: 'No update fields provided' });
    }
    
    // Add user_id to values array
    values.push(userId);
    
    const query = `
    UPDATE users 
    SET ${updates.join(', ')} 
    WHERE user_id = ?
    `;
    
    pool.query(query, values, (error, results) => {
        if (error) {
            console.error('Error updating user:', error);
            
            // Check for duplicate email
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: 'Email already exists' });
            }
            
            return res.status(500).json({ error: 'Database error', details: error.message });
        }
        
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ message: 'User updated successfully' });
    });
});

// API endpoint to delete a user
app.delete('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    
    const query = `DELETE FROM users WHERE user_id = ?`;
    
    pool.query(query, [userId], (error, results) => {
        if (error) {
            console.error('Error deleting user:', error);
            return res.status(500).json({ error: 'Database error', details: error.message });
        }
        
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ message: 'User deleted successfully' });
    });
});

// API endpoint to get logs
app.get('/api/logs', (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    
    const query = `
    SELECT * FROM log
    ORDER BY log_time DESC
    LIMIT ?
    `;
    
    pool.query(query, [limit], (error, results) => {
        if (error) {
            console.error('Error fetching logs:', error);
            return res.status(500).json({ error: 'Database error', details: error.message });
        }
        
        res.json(results);
    });
});

// API endpoint to add a log entry
app.post('/api/logs', (req, res) => {
    const { tag, message, issuer_id, issuerState, ip, verbosity } = req.body;
    
    if (!tag || !message || issuerState === undefined || !ip || verbosity === undefined) {
        return res.status(400).json({ 
            error: 'Missing required fields', 
            requiredFields: ['tag', 'message', 'issuerState', 'ip', 'verbosity'] 
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
                console.error('Error creating log entry:', error);
                return res.status(500).json({ error: 'Database error', details: error.message });
            }
            
            res.status(201).json({ 
                message: 'Log entry created successfully', 
                id: results.insertId 
            });
        }
    );
});

// Start server with error handling
const PORT = 8080;
try {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Test the API at: http://localhost:${PORT}/test`);
        console.log(`Get all users at: http://localhost:${PORT}/api/users`);
    });
} catch (error) {
    console.error('Error starting server:', error);
}
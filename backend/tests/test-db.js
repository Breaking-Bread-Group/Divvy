// API endpoint to create a new group
app.post("/api/groups", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { title, memberIds } = req.body;

  if (!title || !memberIds || !Array.isArray(memberIds)) {
    return res.status(400).json({
      error: "Missing required fields",
      requiredFields: ["title", "memberIds"],
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

        // Insert group members (including the creator)
        const memberValues = [[groupId, req.user.user_id]]; // Add creator as member
        memberIds.forEach(userId => {
          if (userId !== req.user.user_id) { // Don't add creator twice
            memberValues.push([groupId, userId]);
          }
        });

        const addMembersQuery = "INSERT INTO group_members (group_id, user_id) VALUES ?";
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
      COUNT(gm.user_id) as member_count
    FROM divvy_groups g
    JOIN group_members gm ON g.group_id = gm.group_id
    WHERE gm.user_id = ?
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
  const checkMembershipQuery = "SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?";
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
      JOIN group_members gm ON g.group_id = gm.group_id
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
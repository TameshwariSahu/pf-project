const express = require("express");
const router = express.Router();
const db = require("../../db");
const bcrypt = require("bcrypt");

router.post("/register", async (req, res) => {
  try {
    const { userid, password, role } = req.body;

    if (!userid || !password || !role) {
      return res.status(400).send("All fields required ❌");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO \`user\` (userid, password, role)
      VALUES (?, ?, ?)
    `;

    db.query(sql, [userid, hashedPassword, role], (err, result) => {
      if (err?.code === "ER_DUP_ENTRY") {
        return res.send("User already exists ❌");
      }

      if (err) {
        console.log("REGISTER ERROR:", err); 
        return res.status(500).send("DB Error ❌");
      }

      res.send("User Registered ✅");
    });

  } catch (err) {
    console.log("SERVER ERROR:", err);
    res.status(500).send("Server Error ❌");
  }
});

module.exports = router;
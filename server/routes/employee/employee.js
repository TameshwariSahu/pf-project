const express = require("express");
const router = express.Router();
const db = require("../../db");

router.post("/add-employee", (req, res) => {
  const { name, department, pf_no, created_by } = req.body;

  if (!name || !department || !pf_no) {
    return res.status(400).send("All fields required ❌");
  }

  const sql = `INSERT INTO employee_m (name, department, pf_no, created_by) VALUES (?, ?, ?, ?)`;

  db.query(sql, [name, department, pf_no, created_by], (err, result) => {
    if (err?.code === "ER_DUP_ENTRY") return res.status(409).send("Employee already exists ❌");
    if (err) {
      console.log("ADD EMPLOYEE ERROR:", err);
      return res.status(500).send("DB Error ❌");
    }
    res.send("Employee Added ✅");
  });
});

module.exports = router;
const express = require("express");
const router = express.Router();
const db = require("../../db");

router.post("/add-employee", (req, res) => {
  const { name, department, pf_no, created_by } = req.body;

  const sql = `
    INSERT INTO employee_M (name, department, pf_no, created_by)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [name, department, pf_no, created_by], (err, result) => {
    if (err) return res.send(err);
    res.send("Employee Added ✅");
  });
});

module.exports = router;
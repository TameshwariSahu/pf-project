const express = require("express");
const router = express.Router();
const db = require("../../db");

router.post("/update-category", (req, res) => {
  const { employeeId, category } = req.body;

  if (!employeeId || !category) {
    return res.status(400).send("employeeId and category required ❌");
  }

  if (!["Worker", "Executive"].includes(category)) {
    return res.status(400).send("Invalid category ❌");
  }

  db.query(
    "UPDATE employee_m SET category = ? WHERE id = ?",
    [category, employeeId],
    (err, result) => {
      if (err) {
        console.log("UPDATE CATEGORY ERROR:", err);
        return res.status(500).send("DB Error ❌");
      }
      if (result.affectedRows === 0) return res.status(404).send("Employee not found ❌");
      res.send("Category updated ✅");
    }
  );
});

module.exports = router;
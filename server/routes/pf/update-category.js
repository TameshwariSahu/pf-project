const express = require("express");
const router = express.Router();
const db = require("../../db");
const validate = require("../../middleware/validate");
const { updateCategorySchema } = require("../../middleware/schemas");

router.post("/update-category", validate(updateCategorySchema), (req, res) => {
  const { employeeId, category } = req.body;

  db.query(
    "UPDATE employee_m SET category = ? WHERE id = ?",
    [category, employeeId],
    (err, result) => {
      if (err) { console.log("UPDATE CATEGORY ERROR:", err); return res.status(500).send("DB Error ❌"); }
      if (result.affectedRows === 0) return res.status(404).send("Employee not found ❌");
      res.send("Category updated ✅");
    }
  );
});

module.exports = router;
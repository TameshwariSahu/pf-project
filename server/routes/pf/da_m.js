const express = require("express");
const router = express.Router();
const db = require("../../db");

// 🔹 GET PF DATA (WITH CATEGORY)
router.get("/get-all", async (req, res) => {
  try {
    let { employeeId } = req.query;

    const query = `
      SELECT 
        e.category,
        e.pf_no,
        p.month,
        p.year,
        p.basic,
        p.da
      FROM employee_m e
      JOIN pf_t p ON p.employee = e.id
      WHERE LOWER(e.pf_no) = LOWER(?)
      ORDER BY p.year,
      FIELD(p.month,'Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar')
    `;

    const [rows] = await db.promise().query(query, [employeeId]);

    res.json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error ❌");
  }
});


// 🔹 UPDATE CATEGORY
router.post("/update-category", async (req, res) => {
  try {
    const { employeeId, category } = req.body;

    await db.promise().query(
      "UPDATE employee_m SET category = ? WHERE LOWER(pf_no) = LOWER(?)",
      [category, employeeId]
    );

    res.send("Category updated ✅");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error ❌");
  }
});


// 🔹 APPLY DA (🔥 FIXED)
router.post("/apply-da", async (req, res) => {
  try {
    const user = req.headers["x-user"] || "unknown";

    let { month, year, employeeId, da_percent, category } = req.body;

    console.log("REQ BODY:", req.body); // DEBUG

    if (!month || !year || !employeeId || !da_percent) {
      return res.status(400).send("Missing fields ❌");
    }

    // normalize
    employeeId = employeeId.toLowerCase();

    await db.promise().query(
      `UPDATE employee_m 
       SET category = COALESCE(?, category) 
       WHERE LOWER(pf_no) = LOWER(?)`,
      [category, employeeId]
    );

    await db.promise().query(
      `INSERT INTO da_m (year, month, da_percent, category, created_by)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       da_percent = VALUES(da_percent),
       category = VALUES(category),
       created_by = VALUES(created_by)`,
      [year, month, da_percent, category, user]
    );

      await db.promise().query(
        `UPDATE pf_t p
        JOIN employee_m e ON p.employee = e.id
        SET p.da = ROUND(p.basic * ? / 100, 0)
        WHERE p.month = ? AND p.year = ? AND e.category = ?`,
        [da_percent, month, year, category]
      );

    res.send("DA applied successfully ✅");

  } catch (err) {
    console.log("DA ERROR:", err);
    res.status(500).send("Server error ❌");
  }
});

module.exports = router;
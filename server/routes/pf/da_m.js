const express = require("express");
const router = express.Router();
const db = require("../../db");

// 🔹 GET ALL MONTHS (category-wise, no employeeId)
router.get("/get-all", async (req, res) => {
  try {
    const { category } = req.query;

    const query = `
      SELECT DISTINCT p.month, p.year,
        d.da_percent
      FROM pf_t p
      LEFT JOIN da_m d ON d.month = p.month 
        AND d.year = p.year 
        AND LOWER(d.category) = LOWER(?)
      ORDER BY p.year,
      FIELD(p.month,'Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar')
    `;

    const [rows] = await db.promise().query(query, [category]);
    res.json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error ❌");
  }
});

// 🔹 APPLY DA — category ke SAARE employees update karo
router.post("/apply-da", async (req, res) => {
  try {
    const user = req.headers["x-user"] || "unknown";
    let { month, year, da_percent, category } = req.body;

    const now = new Date();
    const IST = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    const istString = IST.toISOString().slice(0, 19).replace('T', ' ');

    // 1. da_m mein save karo
    await db.promise().query(
      `INSERT INTO da_m (year, month, da_percent, category, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       da_percent = VALUES(da_percent),
       created_by = VALUES(created_by),
       created_at = VALUES(created_at)`,
      [year, month, da_percent, category, user, istString]
    );

    // 2. us category ke SAARE employees ki pf_t update karo
    await db.promise().query(
      `UPDATE pf_t p
       JOIN employee_m e ON p.employee = e.id
       SET p.da = ROUND((p.basic * ?) / 100)
       WHERE LOWER(e.category) = LOWER(?)
       AND p.month = ? AND p.year = ?`,
      [da_percent, category, month, year]
    );

    res.send("DA applied for all employees ✅");
  } catch (err) {
    console.log("DA ERROR:", err);
    res.status(500).send("Server error ❌");
  }
});

module.exports = router;
const express = require("express");
const router = express.Router();
const db = require("../../db");

router.get("/get-all", async (req, res) => {
  try {
    const { category } = req.query;

    if (!category) {
      return res.status(400).send("Category required ❌");
    }

    const months = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
    const years = [];
    for (let i = 2008; i <= 2015; i++) years.push(i);

    const [daRows] = await db.promise().query(
      `SELECT month, year, da_percent FROM da_m WHERE LOWER(category) = LOWER(?)`,
      [category]
    );

    const daMap = {};
    daRows.forEach(d => { daMap[`${d.month}-${d.year}`] = d.da_percent; });

    const result = [];
    years.forEach(y => {
      months.forEach(m => {
        const yearForMonth = ["Jan","Feb","Mar"].includes(m) ? y + 1 : y;
        const key = `${m}-${yearForMonth}`;
        result.push({ month: m, year: yearForMonth, da_percent: daMap[key] || null });
      });
    });

    res.json(result);
  } catch (err) {
    console.log("GET-ALL ERROR:", err);
    res.status(500).send("Server error ❌");
  }
});

router.post("/apply-da", async (req, res) => {
  try {
    const user = req.headers["x-user"] || "unknown";
    const { month, year, da_percent, category } = req.body;

    if (!month || !year || !da_percent || !category) {
      return res.status(400).send("All fields required ❌");
    }

    if (!["Worker", "Executive"].includes(category)) {
      return res.status(400).send("Invalid category ❌");
    }

    if (da_percent < 0 || da_percent > 100) {
      return res.status(400).send("Invalid DA percent ❌");
    }

    const now = new Date();
    const IST = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    const istString = IST.toISOString().slice(0, 19).replace('T', ' ');

    await db.promise().query(
      `INSERT INTO da_m (year, month, da_percent, category, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       da_percent = VALUES(da_percent),
       created_by = VALUES(created_by),
       created_at = VALUES(created_at)`,
      [year, month, da_percent, category, user, istString]
    );

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
    console.log("APPLY-DA ERROR:", err);
    res.status(500).send("Server error ❌");
  }
});

module.exports = router;
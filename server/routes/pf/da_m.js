const express = require("express");
const router = express.Router();
const db = require("../../db");

router.post("/apply-da", (req, res) => {
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

  const { getISTTime } = require('../../utils/time');
  const istString = getISTTime();

  db.query(
    `INSERT INTO da_m (year, month, da_percent, category, created_by, created_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
     da_percent = VALUES(da_percent),
     created_by = VALUES(created_by),
     created_at = VALUES(created_at)`,
    [year, month, da_percent, category, user, istString],
    (err) => {
      if (err) {
        console.log("INSERT DA ERROR:", err);
        return res.status(500).send("Server error ❌");
      }

      db.query(
        `UPDATE pf_t p
         JOIN employee_m e ON p.employee = e.id
         SET p.da = ROUND((p.basic * ?) / 100)
         WHERE LOWER(e.category) = LOWER(?)
         AND p.month = ? AND p.year = ?`,
        [da_percent, category, month, year],
        (err) => {
          if (err) {
            console.log("UPDATE DA ERROR:", err);
            return res.status(500).send("Server error ❌");
          }
          res.send("DA applied for all employees ✅");
        }
      );
    }
  );
});

router.get("/get-all", (req, res) => {
  const { category } = req.query;

  if (!category) {
    return res.status(400).send("Category required ❌");
  }

  const months = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
  const years = [];
  for (let i = 2008; i <= 2015; i++) years.push(i);

  db.query(
    `SELECT month, year, da_percent FROM da_m WHERE LOWER(category) = LOWER(?)`,
    [category],
    (err, daRows) => {
      if (err) {
        console.log("GET-ALL ERROR:", err);
        return res.status(500).send("Server error ❌");
      }

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
    }
  );
});

module.exports = router;
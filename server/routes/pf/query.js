const express = require("express");
const router = express.Router();
const db = require("../../db");
const cors = require("cors");
router.use(cors());

router.get("/get-pf", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const search = req.query.search?.trim() || "";

  const searchParams = search ? [`%${search}%`, `%${search}%`] : [];

  const countSql = `
    SELECT COUNT(DISTINCT employee_m.id) as total
    FROM pf_t
    JOIN employee_m ON pf_t.employee = employee_m.id
    ${search ? "WHERE LOWER(employee_m.name) LIKE LOWER(?) OR LOWER(employee_m.pf_no) LIKE LOWER(?)" : ""}
  `;

  db.query(countSql, searchParams, (err, countResult) => {
    if (err) {
      console.log("COUNT ERROR:", err);
      return res.status(500).json({ error: err.message });
    }

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit) || 1;

    const empSql = `
      SELECT DISTINCT employee_m.id
      FROM employee_m
      JOIN pf_t ON pf_t.employee = employee_m.id
      ${search ? "WHERE LOWER(employee_m.name) LIKE LOWER(?) OR LOWER(employee_m.pf_no) LIKE LOWER(?)" : ""}
      ORDER BY employee_m.id
      LIMIT ? OFFSET ?
    `;

    db.query(empSql, [...searchParams, limit, offset], (err, empResult) => {
      if (err) {
        console.log("EMP ERROR:", err);
        return res.status(500).json({ error: err.message });
      }

      if (empResult.length === 0) {
        return res.json({ data: [], totalPages, currentPage: page, total });
      }

      const ids = empResult.map(e => e.id);
      const placeholders = ids.map(() => "?").join(",");

      const sql = `
        SELECT pf_t.*, employee_m.name, employee_m.pf_no, employee_m.department
        FROM pf_t
        JOIN employee_m ON pf_t.employee = employee_m.id
        WHERE employee_m.id IN (${placeholders})
        ORDER BY employee_m.id, pf_t.year, pf_t.month_order
      `;

      db.query(sql, ids, (err, result) => {
        if (err) {
          console.log("QUERY ERROR:", err);
          return res.status(500).json({ error: err.message });
        }
        res.json({ data: result, totalPages, currentPage: page, total });
      });
    });
  });
});
router.get("/get-pf-by-emp/:pfNo", (req, res) => {
  const pfNo = req.params.pfNo;

  const sql = `
    SELECT pf_t.*, employee_m.name, employee_m.department, employee_m.pf_no
    FROM pf_t
    JOIN employee_m ON pf_t.employee = employee_m.id
    WHERE employee_m.pf_no = ?
    ORDER BY pf_t.year, pf_t.month_order
  `;

  db.query(sql, [pfNo], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Error ❌");
    }

    if (result.length === 0) {
      return res.status(404).send("No data ❌");
    }

    res.json(result);
  });
});

module.exports = router;
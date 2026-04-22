const express = require("express");
const router = express.Router();
const db = require("../../db");
const cors = require("cors");
router.use(cors());

router.get("/get-pf", (req, res) => {
  const sql = `
    SELECT pf_t.*, employee_m.name
    FROM pf_t
    JOIN employee_m ON pf_t.employee = employee_m.id
    ORDER BY pf_t.year, pf_t.month_order
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json([]);
    }
    res.json(result);
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
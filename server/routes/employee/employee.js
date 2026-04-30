const express = require("express");
const router = express.Router();
const db = require("../../db");
const validate = require("../../middleware/validate");
const { z } = require("zod");

const addEmployeeSchema = z.object({
  name: z.string().min(1, "Name required"),
  department: z.string().min(1, "Department required"),
  pf_no: z.string().min(1, "PF number required"),
  created_by: z.string().optional()
});

router.post("/add-employee", validate(addEmployeeSchema), (req, res) => {
  const { name, department, pf_no, created_by } = req.body;

  db.query(
    `INSERT INTO employee_m (name, department, pf_no, created_by) VALUES (?, ?, ?, ?)`,
    [name, department, pf_no, created_by],
    (err) => {
      if (err?.code === "ER_DUP_ENTRY") return res.status(409).send("Employee already exists ❌");
      if (err) { console.log("ADD EMPLOYEE ERROR:", err); return res.status(500).send("DB Error ❌"); }
      res.send("Employee Added ✅");
    }
  );
});

module.exports = router;
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../../db");
const cors = require("cors");
router.use(cors());

// Create admin user
router.get("/create-user", async (req, res) => {
  const hashed = await bcrypt.hash("1234", 10);
  db.query("INSERT INTO users (userid,password,role) VALUES (?,?,?)", ["admin", hashed, "admin"], (err) => {
    if (err?.code === "ER_DUP_ENTRY") return res.send("User exists ✅");
    if (err) return res.send(err);
    res.send("User created ✅");
  });
});

// Create finance user
router.get("/create-finance-user", async (req, res) => {
  const hashed = await bcrypt.hash("1234", 10);
  db.query("INSERT INTO user (userid,password,role) VALUES (?,?,?)", ["finance", hashed, "finance"], (err) => {
    if (err?.code === "ER_DUP_ENTRY") return res.send("Finance exists ✅");
    if (err) return res.send(err);
    res.send("Finance created ✅");
  });
});

// admin login
router.post("/login", (req, res) => {
  const { userid, password } = req.body;
  db.query("SELECT * FROM user WHERE userid=?", [userid], async (err, result) => {
    if (err) return res.json({ message: "DB error" });
    if (!result.length) return res.json({ message: "User not found ❌" });
    const user = result[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ message: "Wrong password ❌" });
    if (user.role === "finance") return res.json({ message: "Use Finance Login ❌" });
    res.json({ userid: user.userid, role: user.role, message: "Login ✅" });
  });
});

router.post("/save-da", (req, res) => {
  const { year, startMonth, percent, created_by } = req.body;

  const checkSql = "SELECT * FROM da_m WHERE year=? AND month=?";

  db.query(checkSql, [year, startMonth], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Error checking DA");
    }

    if (result.length > 0) {
      // ✅ UPDATE
      const updateSql = `
        UPDATE da_m 
        SET da_percent=?, created_by=? 
        WHERE year=? AND month=?
      `;

      db.query(updateSql, [percent, created_by, year, startMonth], (err) => {
        if (err) {
          console.log(err);
          return res.status(500).send("Error updating DA");
        }
        res.send("DA updated successfully ✅");
      });

    } else {
      // ✅ INSERT
      const insertSql = `
        INSERT INTO da_m (year, month, da_percent, created_by)
        VALUES (?, ?, ?, ?)
      `;

      db.query(insertSql, [year, startMonth, percent, created_by], (err) => {
        if (err) {
          console.log("ERROR:",err);
          return res.status(500).send("Error inserting DA");
        }
        res.send("DA saved successfully ✅");
      });
    }
  });
});

// Finance login
router.post("/finance-login", (req, res) => {
  const { userid, password } = req.body;
  db.query("SELECT * FROM user WHERE userid=?", [userid], async (err, result) => {
    if (err) return res.json({ message: "DB error" });
    if (!result.length) return res.json({ message: "User not found ❌" });
    const user = result[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ message: "Wrong password ❌" });
    if (user.role !== "finance") return res.json({ message: "Use Normal Login ❌" });
    res.json({ userid: user.userid, role: user.role, message: "Login ✅" });
  });
});

router.post("/save-pf", (req, res) => {
  const { empName, department, pfNo, created_by, data } = req.body;

  // Step 1: check if employee exists
  db.query("SELECT id FROM employee_m WHERE pf_no=?", [pfNo], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Error finding employee ❌");
    }

    const proceedWithPFInsert = (employeeId) => {
      let count = 0;
      let hasError = false;

      const sql = `
        INSERT INTO pf_t 
        (employee, basic, da, vpf, month, year, created_by, employee_share, employer_share)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          basic=VALUES(basic),
          da=VALUES(da),
          vpf=VALUES(vpf),
          created_by=VALUES(created_by),
          employee_share=VALUES(employee_share),
          employer_share=VALUES(employer_share)
      `;

      data.forEach((row) => {
        db.query(
          sql,
          [
            employeeId,
            row.basic,
            row.da,
            row.vpf,
            row.month,
            row.year,
            created_by,
            row.employee_share,
            row.employer_share
          ],
          (err) => {
            if (err && !hasError) {
              hasError = true;
              console.log("ERROR:", err);
              return res.status(500).send("DB Error ❌");
            }

            count++;
            if (count === data.length && !hasError) {
              res.send("PF Data Saved ✅");
            }
          }
        );
      });
    };

    if (result.length > 0) {
      // Employee exists → use existing id
      proceedWithPFInsert(result[0].id);
    } else {
      // Employee does not exist → insert first
      const insertEmp = `
        INSERT INTO employee_m (name, department, pf_no, created_by)
        VALUES (?, ?, ?, ?)
      `;
      db.query(insertEmp, [empName, department, pfNo, created_by], (err, res2) => {
        if (err) {
          console.log(err);
          return res.status(500).send("Error inserting employee ❌");
        }

        const newEmployeeId = res2.insertId;
        proceedWithPFInsert(newEmployeeId);
      });
    }
  });
});

// 🔍 Get PF by Employee No
router.get("/get-pf-by-emp/:pfNo", (req, res) => {
  const pfNo = req.params.pfNo;

  const sql = `
    SELECT pf_t.*, employee_m.name, employee_m.department, employee_m.pf_no
    FROM pf_t
    JOIN employee_m ON pf_t.employee = employee_m.id
    WHERE employee_m.pf_no = ?
    ORDER BY pf_t.id
  `;

  db.query(sql, [pfNo], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Error fetching ❌");
    }

    if (result.length === 0) {
      return res.status(404).send("No data found ❌");
    }

    res.json(result);
  });
});

module.exports = router;
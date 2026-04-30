const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../../db");
const jwt = require("jsonwebtoken");
const { getISTTime } = require('../../utils/time');
const validate = require("../../middleware/validate");
const verifyToken = require("../../middleware/auth");
const { loginSchema, registerSchema, savePFSchema } = require("../../middleware/schemas");
const monthOrderMap = {
  Apr:1, May:2, Jun:3, Jul:4, Aug:5, Sep:6,
  Oct:7, Nov:8, Dec:9, Jan:10, Feb:11, Mar:12
};

// Register
router.post("/register", validate(registerSchema), async (req, res) => {
  const istString = getISTTime();
  const { userid, password, role, created_by } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);
    db.query(
      "INSERT INTO user (userid, password, role, created_by, created_at) VALUES (?, ?, ?, ?, ?)",
      [userid, hashed, role, created_by, istString],
      (err) => {
        if (err?.code === "ER_DUP_ENTRY") return res.status(409).send("User already exists ❌");
        if (err) {
          console.log("REGISTER ERROR:", err);
          return res.status(500).send("DB Error ❌");
        }
        res.send("User registered ✅");
      }
    );
  } catch (err) {
    console.log("SERVER ERROR:", err);
    res.status(500).send("Server error ❌");
  }
});

// Normal login
router.post("/login", validate(loginSchema), (req, res) => {
  const { userid, password } = req.body;
  db.query("SELECT * FROM user WHERE userid=?", [userid], async (err, result) => {
    if (err) return res.status(500).json({ message: "DB error ❌" });
    if (!result.length) return res.status(404).json({ message: "User not found ❌" });

    const user = result[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Wrong password ❌" });
    if (user.role === "admin") return res.status(403).json({ message: "Use Finance Login ❌" });

    const token = jwt.sign(
      { userid: user.userid, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ userid: user.userid, role: user.role, token, message: "Login ✅" });
  });
});

// Finance login
router.post("/finance-login", validate(loginSchema), (req, res) => {
  const { userid, password } = req.body;
  db.query("SELECT * FROM user WHERE userid=?", [userid], async (err, result) => {
    if (err) return res.status(500).json({ message: "DB error ❌" });
    if (!result.length) return res.status(404).json({ message: "User not found ❌" });

    const user = result[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Wrong password ❌" });
    if (user.role !== "admin") return res.status(403).json({ message: "Use Normal Login ❌" });

    const token = jwt.sign(
      { userid: user.userid, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ userid: user.userid, role: user.role, token, message: "Login ✅" });
  });
});

// Save DA
router.post("/save-da", (req, res) => {
  const istString = getISTTime();
  const { year, startMonth, percent, created_by } = req.body;

  const checkSql = "SELECT * FROM da_m WHERE year=? AND month=?";
  db.query(checkSql, [year, startMonth], (err, result) => {
    if (err) { console.log(err); return res.status(500).send("Error checking DA ❌"); }

    if (result.length > 0) {
      db.query(
        "UPDATE da_m SET da_percent=?, created_by=?, created_at=? WHERE year=? AND month=?",
        [percent, created_by, istString, year, startMonth],
        (err) => {
          if (err) { console.log(err); return res.status(500).send("Error updating DA ❌"); }
          res.send("DA updated successfully ✅");
        }
      );
    } else {
      db.query(
        "INSERT INTO da_m (year, month, da_percent, created_by, created_at) VALUES (?, ?, ?, ?, ?)",
        [year, startMonth, percent, created_by, istString],
        (err) => {
          if (err) { console.log(err); return res.status(500).send("Error inserting DA ❌"); }
          res.send("DA saved successfully ✅");
        }
      );
    }
  });
});

// Save PF

router.post("/save-pf", verifyToken, validate(savePFSchema), (req, res) => {  const istString = getISTTime();
  const { empName, department, pfNo, created_by, category, data } = req.body;

  db.query("SELECT id FROM employee_m WHERE pf_no=?", [pfNo], (err, result) => {
    if (err) return res.status(500).send("Error finding employee ❌");

    const proceedWithPFInsert = (employeeId) => {
      let count = 0;
      let hasError = false;

      const sql = `
        INSERT INTO pf_t 
        (employee, basic, da, vpf, month, month_order, year, created_by, employee_share, employer_share, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          basic=VALUES(basic), da=VALUES(da), vpf=VALUES(vpf),
          created_by=VALUES(created_by), employee_share=VALUES(employee_share),
          employer_share=VALUES(employer_share), created_at=VALUES(created_at)
      `;

      data.forEach((row) => {
        const month_order = monthOrderMap[row.month];
        db.query(sql, [employeeId, row.basic, row.da, row.vpf, row.month, month_order, row.year, created_by, row.employee_share, row.employer_share, istString],
          (err) => {
            if (err && !hasError) { hasError = true; return res.status(500).send("DB Error ❌"); }
            count++;
            if (count === data.length && !hasError) {
              const applyCurrentDA = `
                UPDATE pf_t p
                JOIN employee_m e ON p.employee = e.id
                JOIN da_m d ON d.month = p.month AND d.year = p.year AND LOWER(d.category) = LOWER(e.category)
                SET p.da = ROUND((p.basic * d.da_percent) / 100)
                WHERE e.id = ?
              `;
              db.query(applyCurrentDA, [employeeId], (err) => {
                if (err) console.log("DA apply error:", err);
                res.send("PF Data Saved ✅");
              });
            }
          }
        );
      });
    };

    if (result.length > 0) {
      db.query("UPDATE employee_m SET category=? WHERE pf_no=?", [category, pfNo], () => {
        proceedWithPFInsert(result[0].id);
      });
    } else {
      db.query(
        "INSERT INTO employee_m (name, department, pf_no, category, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        [empName, department, pfNo, category, created_by, istString],
        (err, res2) => {
          if (err) return res.status(500).send("Error inserting employee ❌");
          proceedWithPFInsert(res2.insertId);
        }
      );
    }
  });
});

// Get PF by Employee
router.get("/get-pf-by-emp/:pfNo", (req, res) => {
  const pfNo = req.params.pfNo;
  if (!pfNo) return res.status(400).send("PF Number required ❌");

  const sql = `
    SELECT pf_t.*, employee_m.name, employee_m.department, employee_m.pf_no, employee_m.category
    FROM pf_t
    JOIN employee_m ON pf_t.employee = employee_m.id
    WHERE employee_m.pf_no = ?
    ORDER BY pf_t.employee, pf_t.year, pf_t.month_order
  `;

  db.query(sql, [pfNo], (err, result) => {
    if (err) { console.log(err); return res.status(500).send("Error fetching ❌"); }
    if (result.length === 0) return res.status(404).send("No data found ❌");
    res.json(result);
  });
});

module.exports = router;
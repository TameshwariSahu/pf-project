// const express = require("express");
// const router = express.Router();
// const db = require("../../db");

// // 🔹 GET PF DATA (WITH CATEGORY)
// router.get("/get-all", async (req, res) => {
//   try {
//     let { employeeId } = req.query;

//     const query = `
//       SELECT 
//         e.category,
//         p.month,
//         p.year,
//         p.basic,
//         p.da
//       FROM employee_m e
//       JOIN pf_t p ON p.employee = e.id
//       WHERE e.pf_no = ?
//       ORDER BY p.year,
//       FIELD(p.month,'Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar')
//     `;

//     const [rows] = await db.promise().query(query, [employeeId]);

//     res.json(rows);
//   } catch (err) {
//     console.log(err);
//     res.status(500).send("Error ❌");
//   }
// });

// // 🔹 UPDATE CATEGORY
// router.post("/update-category", async (req, res) => {
//   try {
//     const { employeeId, category } = req.body;

//     await db.promise().query(
//       "UPDATE employee_m SET category = ? WHERE pf_no = ?",
//       [category, employeeId]
//     );

//     res.send("Category updated ✅");
//   } catch (err) {
//     console.log(err);
//     res.status(500).send("Error ❌");
//   }
// });

// // 🔹 APPLY DA
// router.post("/apply-da", async (req, res) => {
//   try {
//     const user = req.headers["x-user"] || "unknown";
//     let { month, year, employeeId, da_percent, category } = req.body;

//     console.log({ month, year, employeeId, da_percent, category });

//     if (!month || !year || !employeeId || !da_percent) {
//       return res.status(400).send("All fields required ❌");
//     }

//     // update category
//     await db.promise().query(
//       `UPDATE employee_m SET category = ? WHERE pf_no = ?`,
//       [category, employeeId]
//     );

//     // insert da
//     await db.promise().query(
//       `INSERT INTO da_m (year, month, da_percent, category, created_by)
//        VALUES (?, ?, ?, ?, ?)
//        ON DUPLICATE KEY UPDATE
//          da_percent = VALUES(da_percent),
//          category = VALUES(category),
//          created_by = VALUES(created_by)`,
//       [year, month, da_percent, category, user]
//     );

//     // update pf_t
//     const [result] = await db.promise().query(
//       `UPDATE pf_t p
//        JOIN employee_m e ON p.employee = e.id
//        SET p.da = ROUND(p.basic * ? / 100, 0)
//        WHERE p.month = ? 
//        AND p.year = ? 
//        AND e.category = ?
//        AND e.pf_no = ?`,
//       [da_percent, month, year, category, employeeId]
//     );

//     console.log("Rows updated:", result.affectedRows);

//     res.send(`DA applied ✅ Rows updated: ${result.affectedRows}`);

//   } catch (err) {
//     console.log(err);
//     res.status(500).send("Error ❌");
//   }
// });

// module.exports = router;

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

    let { month, year, da_percent, category } = req.body;

    // ✅ CLEAN INPUT
    const cleanMonth = month?.trim();
    const cleanCategory = category?.trim();

    console.log("INPUT:", { cleanMonth, year, da_percent, cleanCategory });

    if (!cleanMonth || !year || !da_percent || !cleanCategory) {
      return res.status(400).send("All fields required ❌");
    }

    // ✅ STEP 1: Insert / Update da_m
    await db.promise().query(
      `INSERT INTO da_m (year, month, da_percent, category, created_by)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         da_percent = VALUES(da_percent),
         category = VALUES(category),
         created_by = VALUES(created_by)`,
      [year, cleanMonth, da_percent, cleanCategory, user]
    );

    // ✅ STEP 2: Get ALL employee IDs of that category
    const [employees] = await db.promise().query(
      `SELECT id FROM employee_m WHERE LOWER(category) = LOWER(?)`,
      [cleanCategory]
    );

    if (employees.length === 0) {
      return res.send("⚠️ No employees found for this category");
    }

    const empIds = employees.map(e => e.id);

    console.log("Employee IDs:", empIds);

    // ✅ STEP 3: Update pf_t using employee IDs (NO JOIN ISSUE)
    const [result] = await db.promise().query(
      `UPDATE pf_t
       SET da = ROUND(basic * ? / 100, 0)
       WHERE LOWER(month) = LOWER(?) 
       AND year = ?
       AND employee IN (?)`,
      [da_percent, cleanMonth, year, empIds]
    );

    console.log("Rows updated:", result.affectedRows);

    if (result.affectedRows === 0) {
      return res.send("⚠️ No PF rows updated (check month/year data)");
    }

    res.send(`✅ DA applied to ${result.affectedRows} records`);

  } catch (err) {
    console.log(err);
    res.status(500).send("Error ❌");
  }
});

module.exports = router;
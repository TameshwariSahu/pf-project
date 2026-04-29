const express = require("express");
const router = express.Router();
const db = require("../../db");
const bcrypt = require("bcrypt");
const validate = require("../../middleware/validate");
const { registerSchema } = require("../../middleware/schemas");

router.post("/register", validate(registerSchema), async (req, res) => {
  try {
    const { userid, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO `user` (userid, password, role) VALUES (?, ?, ?)",
      [userid, hashedPassword, role],
      (err) => {
        if (err?.code === "ER_DUP_ENTRY") return res.status(409).send("User already exists ❌");
        if (err) { console.log("REGISTER ERROR:", err); return res.status(500).send("DB Error ❌"); }
        res.send("User Registered ✅");
      }
    );
  } catch (err) {
    console.log("SERVER ERROR:", err);
    res.status(500).send("Server Error ❌");
  }
});

module.exports = router;
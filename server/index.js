// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");

// const app = express();

// /* =========================
//    CORS CONFIG (SAFE)
// ========================= */
// const corsOptions = {
//   origin: [
//     "http://localhost:5173",
//     "http://127.0.0.1:5173",
//      "https://pf-statement.netlify.app",
//     "https://pf-backend-g33n.onrender.com"
//   ],
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true
// };

// app.use(cors(corsOptions));   // ✅ MUST BE FIRST
// app.use(express.json());      // ✅ JSON parser

// /* =========================
//    HEALTH CHECK ROUTE
// ========================= */
// app.get("/", (req, res) => {
//   res.send("Backend working ✅");
// });

// /* =========================
//    ROUTES
// ========================= */

// // Auth routes
// const loginRoutes = require("./routes/auth/login");
// const userRoutes = require("./routes/auth/user");
// app.use("/auth", loginRoutes);
// app.use("/auth", userRoutes);

// // PF routes
// const pfRoutes = require("./routes/pf/query");
// app.use("/pf", pfRoutes);

// // Employee routes
// const employeeRoutes = require("./routes/employee/employee");
// app.use("/employee", employeeRoutes);

// // DA routes
// const da_mRouter = require("./routes/pf/da_m");
// app.use("/da_m", da_mRouter);

// /* =========================
//    SERVER START
// ========================= */
// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log("Server running on", PORT);
// });
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const app = express();

// ✅ Proper CORS
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://pf-project-frontend-2ky5x05t6-tameshwarisahus-projects.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// routes
const loginRoutes = require("./routes/auth/login");
const userRoutes = require("./routes/auth/user");
app.use("/auth", loginRoutes);
app.use("/auth", userRoutes);

const pfRoutes = require("./routes/pf/query");
app.use("/pf", pfRoutes);

const employeeRoutes = require("./routes/employee/employee");
app.use("/employee", employeeRoutes);

const da_mRouter = require("./routes/pf/da_m");
app.use("/da_m", da_mRouter);

// test
app.get("/", (req, res) => {
  res.send("Backend working ✅");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on", PORT);
});

require('dotenv').config();
const express = require("express");
const cors = require("cors");
const app = express();

// ✅ Proper CORS

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  /^https:\/\/.*\.vercel\.app$/
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:5173",
      /^https:\/\/.*\.vercel\.app$/
    ];

    const allowed = allowedOrigins.some(o =>
      typeof o === "string" ? o === origin : o.test(origin)
    );

    if (allowed) {
      callback(null, true);
    } else {
      callback(null, true); // temp allow (DEV SAFE MODE)
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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

const pfCategoryRoutes = require("./routes/pf/update-category");
app.use("/pf", pfCategoryRoutes);

// test
app.get("/", (req, res) => {
  res.send("Backend working ✅");
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found ❌" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err.stack);
  res.status(500).json({ error: "Internal server error ❌" });
});

const PORT = process.env.PORT || 5000;
app.get("/ping", (req, res) => res.send("pong"));
app.listen(PORT, () => {
  console.log("Server running on", PORT);
});
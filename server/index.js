
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

    const allowed = allowedOrigins.some(o =>
      typeof o === "string" ? o === origin : o.test(origin)
    );

    if (allowed) {
      return callback(null, true);
    } else {
      return callback(new Error("CORS blocked: " + origin));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

app.options("*", cors());

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
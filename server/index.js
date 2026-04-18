
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const app = express();

// ✅ Proper CORS
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (
      origin === "http://localhost:5173" ||
      origin.endsWith(".vercel.app")
    ) {
      callback(null, true);
    } else {
      callback(null, true); // TEMP FIX (important)
    }
  },
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
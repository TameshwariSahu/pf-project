require('dotenv').config();
const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://pf-project-backend.onrender.com"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

app.use(express.json());

app.use(express.json());

// 🔹 Auth routes
const loginRoutes = require("./routes/auth/login");
const userRoutes = require("./routes/auth/user");
app.use("/auth", loginRoutes);  
app.use("/auth", userRoutes);  

// 🔹 PF routes
const pfRoutes = require("./routes/pf/query");
app.use("/pf", pfRoutes);     

// 🔹 Employee routes
const employeeRoutes = require("./routes/employee/employee");
app.use("/employee", employeeRoutes); 

const da_mRouter = require("./routes/pf/da_m");
app.use("/da_m", da_mRouter);

// app.get("/", (req, res) => {
//   res.json({
//     status: "success",
//     message: "Backend is running 🚀"
//   });
// });
app.get("/", (req, res) => {
  res.send("Backend working ✅");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on", PORT);
});

// const mysql = require("mysql2");
// /* 
// const db = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT || 3306
// }); */

// const DB_URL=process.env.DB_URL || "";
// const db = mysql.createPool(DB_URL);

// db.getConnection((err) => {
//   if (err) {
//     console.log("DB connection failed ❌", err);
//   } else {
//     console.log("DB connected ✅");
//   }
// });

// module.exports = db;

const mysql = require("mysql2");
const fs = require("fs");
require("dotenv").config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // ssl: {
  //   ca: fs.readFileSync("./ca.pem")
  // }
  
});

db.getConnection((err) => {
  if (err) {
    console.log("DB connection failed ❌", err);
  } else {
    console.log("DB connected ✅");
  }
});

module.exports = db;
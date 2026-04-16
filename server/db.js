
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

// const mysql = require("mysql2");
// const fs = require("fs");
// require("dotenv").config();

// const db = mysql.createPool({
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   // ssl: {
//   //   rejectUnauthorized: false
//   // }
  
// });

// db.getConnection((err) => {
//   if (err) {
//     console.log("DB connection failed ❌", err);
//   } else {
//     console.log("DB connected ✅");
//   }
//   console.log("DB_HOST =", process.env.DB_HOST);
// console.log("DB_PORT =", process.env.DB_PORT);
// });

// module.exports = db;

const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  ssl: {
    rejectUnauthorized: false
  }
});

db.connect((err) => {
  if (err) {
    console.log("DB connection failed ❌", err);
  } else {
    console.log("DB connected ✅");
  }
  console.log("HOST:", process.env.DB_HOST);
});

module.exports = db;


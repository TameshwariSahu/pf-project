const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  ssl: {
    rejectUnauthorized: false
  },
     timezone: '+05:30' 
});

db.connect((err) => {
  if (err) {
    console.log("DB connection failed ❌", err.message);
     process.exit(1);
  } else {
    console.log("DB connected ✅");
  }
  console.log("HOST:", process.env.DB_HOST);
});

module.exports = db;


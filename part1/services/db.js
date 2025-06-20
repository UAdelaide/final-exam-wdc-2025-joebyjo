const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: DB_PASS,
  database: DB_NAME,
});

module.exports = pool;
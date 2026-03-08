const mysql = require('mysql2/promise');

// El resto del código igual:
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'basesilla',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;
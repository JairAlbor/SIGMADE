const connection = require('./backend/db');

connection.query(
    'SELECT id, nombre, email, password FROM usuario WHERE email = ?',
    ['admin@utm.edu.mx'],
    (err, results) => {
        if (err) {
            console.error('Error:', err);
            process.exit(1);
        }
        console.log('User found:', JSON.stringify(results, null, 2));
        connection.end();
        process.exit(0);
    }
);

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10,
    queueLimit: 0,
    port: process.env.DB_PORT,
});

(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ ¡Conexión exitosa a la base de datos MySQL "michiato"!');
        connection.release();
    } catch (error) {
        console.error('❌ Error crítico al conectar a MySQL. Revisa que tu servidor local esté encendido.');
        console.error('Detalle del error:', error.message);
    }
})();

export default pool;
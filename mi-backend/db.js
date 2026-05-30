import mysql from 'mysql2/promise';



// Configuramos el pool de conexiones con las credenciales de tu MySQL local
const pool = mysql.createPool({
    host: "47vmf0.h.filess.io",
    user: "michiato_stoodhonor",
    password: "01e4a319704125d3475f5edb105210144555f843",
    database: "michiato_stoodhonor",
    connectionLimit: 10,       // Máximo de conexiones simultáneas que mantendrá abiertas
    queueLimit: 0,              // Sin límite de peticiones en cola
    port: 61002,
});

// Función de prueba inmediata para verificar que conecte al arrancar el backend
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ ¡Conexión exitosa a la base de datos MySQL "michiato"!');
        connection.release(); // Siempre liberamos la conexión de vuelta al pool
    } catch (error) {
        console.error('❌ Error crítico al conectar a MySQL. Revisa que tu servidor local esté encendido.');
        console.error('Detalle del error:', error.message);
    }
})();

// Exportamos el pool para poder tirar queries desde tus archivos de rutas (como pedidos.js)
export default pool;
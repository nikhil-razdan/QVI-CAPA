import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool(process.env.DATABASE_URL ?? '');

(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('DB connected.');
        connection.release();
    } catch (err) {
        console.error('DB connection error:', err);
    }
})();

export default pool;

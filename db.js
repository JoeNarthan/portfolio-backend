import mysql from 'mysql2/promise';

export const db = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.root,
    password: process.env.visal1122,
    database: process.env.DB_NAME
})
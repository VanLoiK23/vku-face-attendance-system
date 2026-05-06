require('dotenv').config();
const { Sequelize } = require('sequelize');
const { Pool } = require('pg');

// 1. Cấu hình cho Sequelize (CRUD)
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: false, // Tắt log SQL để terminal sạch hơn
        pool: { max: 10, min: 0, idle: 10000 }
    }
);

// Config connect
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    max: 20, // Số lượng kết nối tối đa trong pool
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        const client = await pool.connect();
        console.log("PostgreSQL & Sequelize connected!");
        client.release(); // release client after establish 
    } catch (err) {
        console.error("Database connection error:", err.message);
        process.exit(1); 
    }
};

module.exports = { sequelize, pool, connectDB };
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AttendanceRecord = sequelize.define('AttendanceRecord', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    session_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    student_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: { 
        type: DataTypes.STRING(20), 
        defaultValue: 'present',
        validate: { isIn: [['present', 'absent']] }
    },
    checkinTime: { type: DataTypes.DATE, field: 'checkin_time' },
    similarity: { type: DataTypes.FLOAT }
}, { tableName: 'attendance_records', underscored: true, timestamps: false });

module.exports = AttendanceRecord;
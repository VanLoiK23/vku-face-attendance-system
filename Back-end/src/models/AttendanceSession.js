const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AttendanceSession = sequelize.define('AttendanceSession', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sessionDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'session_date' }
}, { tableName: 'attendance_sessions', underscored: true, timestamps: false });

module.exports = AttendanceSession;
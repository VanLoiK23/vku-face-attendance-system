const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Schedule = sequelize.define('Schedule', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    dayOfWeek: { 
        type: DataTypes.INTEGER, 
        field: 'day_of_week',
        validate: { min: 2, max: 8 } 
    },
    startPeriod: { type: DataTypes.INTEGER, field: 'start_period' },
    endPeriod: { type: DataTypes.INTEGER, field: 'end_period' },
    weekStart: { type: DataTypes.INTEGER, field: 'week_start' },
    weekEnd: { type: DataTypes.INTEGER, field: 'week_end' },
    room: { type: DataTypes.STRING(50) }
}, { tableName: 'schedules', underscored: true, timestamps: false });

module.exports = Schedule;
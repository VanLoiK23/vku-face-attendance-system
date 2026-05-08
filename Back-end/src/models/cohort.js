const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Cohort = sequelize.define('Cohort', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(50), unique: true } // 23AI, 23IT
}, {
    tableName: 'cohorts',
    timestamps: false
});

module.exports = Cohort
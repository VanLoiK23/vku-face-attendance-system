const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Class = sequelize.define('Class', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    room: { type: DataTypes.STRING(50) }
}, { tableName: 'classes', underscored: true, timestamps: false });

module.exports = Class;
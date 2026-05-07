const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ClassSection = sequelize.define('ClassSection', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    name: { type: DataTypes.STRING, allowNull: false }, // Web-01, Web-02

    room: { type: DataTypes.STRING(50) }
}, {
    tableName: 'class_sections',
    underscored: true,
    timestamps: false
});

module.exports = ClassSection;
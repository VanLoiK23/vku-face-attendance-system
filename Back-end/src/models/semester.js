const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Semester = sequelize.define('Semester', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    start_date: {
        type: DataTypes.DATEONLY, 
        allowNull: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'semesters',
    timestamps: false 
});

module.exports = Semester;
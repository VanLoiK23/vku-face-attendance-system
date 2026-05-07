const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Student = sequelize.define('Student', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    studentCode: {
        type: DataTypes.STRING(50),
        unique: true,
        field: 'student_code'
    },

    faceStatus: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
            isIn: [['confirm', 'pending', 'reject']]
        }
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'students',
    underscored: true,
    timestamps: false
});

module.exports = Student;
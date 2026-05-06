const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
    // id SERIAL PRIMARY KEY -> INTEGER + autoIncrement
    id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    email: { 
        type: DataTypes.STRING(255), 
        unique: true, 
        allowNull: false,
        validate: { isEmail: true } 
    },
    password: { 
        type: DataTypes.STRING(255), 
        allowNull: false 
    },
    role: { 
        type: DataTypes.STRING(20), 
        allowNull: false,
        validate: {
            isIn: [['admin', 'teacher', 'student']] 
        }
    },
    reset_token: { 
        type: DataTypes.STRING, 
        allowNull: true 
    },
    reset_token_expiry: { 
        type: DataTypes.DATE, 
        allowNull: true 
    }
}, {
    tableName: 'users',   
    underscored: true,
    timestamps: false     
});

module.exports = User;
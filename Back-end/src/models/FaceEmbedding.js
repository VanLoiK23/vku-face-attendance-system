const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FaceEmbedding = sequelize.define('FaceEmbedding', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    embedding: { type: DataTypes.ARRAY(DataTypes.FLOAT) } 
}, { tableName: 'face_embeddings', underscored: true, timestamps: false });


module.exports = FaceEmbedding;
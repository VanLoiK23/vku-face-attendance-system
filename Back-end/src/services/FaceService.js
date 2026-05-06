const { pool } = require('../config/database'); // Import từ file config chung
const FaceEmbedding = require('../models/face_embedding');


const findStudentByVector = async (embedding) => {
    const vectorStr = `[${embedding.join(',')}]`;
    const sql = `
        SELECT student_id, (embedding <=> $1) as distance 
        FROM face_embeddings 
        ORDER BY distance ASC 
        LIMIT 1
    `;
    try {
        const result = await pool.query(sql, [vectorStr]);
        return result.rows[0];
    } catch (error) {
        console.log(error);
        return error;
    }
};

const faceService = {
    saveEmbedding: async (student_id, embedding) => {
        return await FaceEmbedding.create({ student_id, embedding });
    },

    deleteEmbeddings: async (student_id) => {
        return await FaceEmbedding.destroy({ where: { student_id } });
    },

    getAllEmbeddings: async () => await FaceEmbedding.findAll()
};

module.exports = { findStudentByVector,faceService };
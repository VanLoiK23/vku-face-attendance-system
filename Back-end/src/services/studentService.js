const Student = require('../models/student');
const User = require('../models/user');

const studentService = {
    create: async (data,t) => {
        return await Student.create(data, { transaction: t });
    },

    getAll: async () => {
        return await Student.findAll({
            include: [{
                model: User,
                attributes: ['email', 'role']
            }]
        });
    },

    getByCode: async (code) => {
        return await Student.findOne({
            where: { student_code: code },
            include: [{ model: User, attributes: ['email'] }]
        });
    },

    getById: async (id) => {
        return await Student.findByPk(id, {
            include: [{ model: User, attributes: ['email'] }]
        });
    },

    update: async (id, updateData) => {
        return await Student.update(updateData, { where: { id } });
    },

    delete: async (id) => {
        return await Student.destroy({ where: { id } });
    }
};

module.exports = studentService;
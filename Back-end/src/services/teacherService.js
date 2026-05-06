const Teacher = require('../models/teacher');
const User = require('../models/user');

const teacherService = {
    create: async (data,t) => await Teacher.create(data, { transaction: t }),
    
    getAll: async () => await Teacher.findAll({
        include: [{ model: User, attributes: ['email', 'role'] }]
    }),

    getById: async (id) => await Teacher.findByPk(id, {
        include: [{ model: User, attributes: ['email'] }]
    }),

    update: async (id, data) => await Teacher.update(data, { where: { id } }),
    
    delete: async (id) => await Teacher.destroy({ where: { id } })
};

module.exports = teacherService;
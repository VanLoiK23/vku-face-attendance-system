const Class = require('../models/class');
const Teacher = require('../models/teacher');
const Student = require('../models/student');

const classService = {
    create: async (data) => await Class.create(data),

    // select list classes attach name teacher
    getAll: async () => await Class.findAll({
        include: [{ model: Teacher, attributes: ['name'] }]
    }),

    getDetails: async (id) => await Class.findByPk(id, {
        include: [
            { model: Teacher, attributes: ['name'] },
            { model: Student, attributes: ['student_code', 'name'] }
        ]
    }),

    update: async (id, data) => await Class.update(data, { where: { id } }),
    
    delete: async (id) => await Class.destroy({ where: { id } })
};

module.exports = classService;
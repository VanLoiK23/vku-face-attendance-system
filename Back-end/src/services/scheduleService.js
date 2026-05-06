const Schedule = require('../models/schedule');
const Class = require('../models/class');

const scheduleService = {
    create: async (data) => await Schedule.create(data),

    getByDay: async (day) => await Schedule.findAll({
        where: { day_of_week: day },
        include: [{ model: Class, attributes: ['name', 'room'] }]
    }),

    getByClass: async (classId) => await Schedule.findAll({
        where: { class_id: classId }
    })
};

module.exports = scheduleService;
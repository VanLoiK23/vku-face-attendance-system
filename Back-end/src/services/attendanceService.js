const AttendanceSession = require('../models/AttendanceSession');
const AttendanceRecord = require('../models/AttendanceRecord');
const Student = require('../models/student');

const attendanceService = {
    createSession: async (data) => await AttendanceSession.create(data),

    bulkCreateRecords: async (records) => {
        return await AttendanceRecord.bulkCreate(records);
    },

    upsertRecord: async (data) => {
        const { session_id, student_id, status, checkinTime, similarity } = data;
        return await AttendanceRecord.upsert({
            session_id, student_id, status, checkinTime, similarity
        }, {
            // Chỉ định Postgres dựa vào cặp này để xử lý xung đột
            conflictFields: ['session_id', 'student_id'] 
        });
    },

    getRecordsBySession: async (sessionId) => await AttendanceRecord.findAll({
        where: { session_id: sessionId },
        include: [{ model: Student, attributes: ['student_code', 'name'] }]
    }),

    getHistoryByStudent: async (studentId) => await AttendanceRecord.findAll({
        where: { student_id: studentId },
        include: [{ model: AttendanceSession, attributes: ['session_date'] }]
    })
};

module.exports = attendanceService;
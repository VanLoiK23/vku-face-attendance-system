const AttendanceSession = require('../models/attendance_session');
const AttendanceRecord = require('../models/attendance_record');
const Student = require('../models/student');

const attendanceService = {
    createSession: async (data) => await AttendanceSession.create(data),

    upsertRecord: async (data) => {
        const { session_id, student_id, status, checkin_time, similarity } = data;
        return await AttendanceRecord.upsert({
            session_id, student_id, status, checkin_time, similarity
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
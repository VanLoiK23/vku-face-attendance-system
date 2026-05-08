const Student = require('../models/student');
const User = require('../models/user');
const Schedule = require('../models/schedule');
const Class = require('../models/class');
const AttendanceRecord = require('../models/AttendanceRecord');
const AttendanceSession = require('../models/AttendanceSession');

const { Op } = require('sequelize');

const getDashboard = async (studentId) => {
    if (!studentId) throw new Error('studentId is required');

    // 1. INFO STUDENT 
    // FIX: Thêm through: { attributes: [] } để không lấy các cột timestamp ảo ở bảng trung gian
    const student = await Student.findByPk(studentId, {
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['email']
            },
            {
                model: Class,
                as: 'classes', // Tên alias Many-to-Many của bạn
                attributes: ['id', 'name'],
                through: { attributes: [] } // QUAN TRỌNG: Bỏ qua các cột created_at/updated_at ở bảng enrollments
            }
        ]
    });

    if (!student) {
        throw new Error('Student not found');
    }

    // 2. GET CLASS IDS
    // Đảm bảo student.classes tồn tại (tránh lỗi map of undefined)
    const classIds = student.classes ? student.classes.map(item => item.id) : [];

    // 3. TODAY'S SCHEDULES
    const now = new Date();
    const dayOfWeekJS = now.getDay();
    const currentDayOfWeek = dayOfWeekJS === 0 ? 8 : dayOfWeekJS + 1;

    let schedules = [];
    if (classIds.length > 0) {
        schedules = await Schedule.findAll({
            where: {
                dayOfWeek: currentDayOfWeek,
                class_id: { [Op.in]: classIds }
            },
            include: [
                {
                    model: Class,
                    as: 'class',
                    attributes: ['id', 'name']
                }
            ],
            // FIX: Đổi 'start_time' thành 'startPeriod' theo model của bạn
            order: [['startPeriod', 'ASC']] 
        });
    }

    // 4. RECENT ATTENDANCE
    const recentAttendance = await AttendanceRecord.findAll({
        where: { student_id: studentId },
        limit: 5,
        order: [['id', 'DESC']],
        include: [
            {
                model: AttendanceSession,
                as: 'session',
                // Nếu bảng AttendanceSession cũng báo lỗi created_at tương tự, 
                // hãy thêm attributes cụ thể vào đây.
            }
        ]
    });

    // 5. STATS
    const totalPresent = await AttendanceRecord.count({
        where: { student_id: studentId, status: 'present' }
    });

    const totalAbsent = await AttendanceRecord.count({
        where: { student_id: studentId, status: 'absent' }
    });

    const total = totalPresent + totalAbsent;
    const attendanceRate = total > 0 ? Math.round((totalPresent / total) * 100) : 0;

    return {
        student,
        stats: {
            totalPresent,
            totalAbsent,
            attendanceRate,
            todaySchedules: schedules.length
        },
        schedules,
        recentAttendance
    };
};

module.exports = { getDashboard };
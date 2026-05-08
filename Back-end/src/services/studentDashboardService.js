const Student = require("../models/student");
const User = require("../models/user");
const Schedule = require("../models/schedule");
const ClassSection = require("../models/class_section");
const AttendanceRecord = require("../models/AttendanceRecord");
const AttendanceSession = require("../models/AttendanceSession");
const { Op } = require("sequelize");

const getDashboard = async (userId) => {
  if (!userId) throw new Error("userId is required");

  // 🔥 FIX: find by user_id (KHÔNG dùng findByPk)
  const student = await Student.findOne({
    where: { user_id: userId },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["email"],
      },
      {
        model: ClassSection,
        as: "classSections",
        attributes: ["id", "name"],
        through: { attributes: [] },
      },
    ],
  });

  if (!student) throw new Error("Student not found");

  const classIds = student.classSections?.map((c) => c.id) || [];

  const now = new Date();

  // 🔥 FIX: dayOfWeek chuẩn JS
  const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay();

  let schedules = [];

  if (classIds.length > 0) {
    schedules = await Schedule.findAll({
      where: {
        dayOfWeek,
        class_section_id: { [Op.in]: classIds },
      },
      include: [
        {
          model: ClassSection,
          as: "classSection",
          attributes: ["id", "name"],
        },
      ],
      order: [["startPeriod", "ASC"]],
    });
  }

  const recentAttendance = await AttendanceRecord.findAll({
    where: { student_id: student.id },
    limit: 5,
    order: [["id", "DESC"]],
    include: [
      {
        model: AttendanceSession,
        as: "session",
      },
    ],
  });

  const totalPresent = await AttendanceRecord.count({
    where: { student_id: student.id, status: "present" },
  });

  const totalAbsent = await AttendanceRecord.count({
    where: { student_id: student.id, status: "absent" },
  });

  const total = totalPresent + totalAbsent;

  return {
    student,
    stats: {
      totalPresent,
      totalAbsent,
      attendanceRate: total ? Math.round((totalPresent / total) * 100) : 0,
      todaySchedules: schedules.length,
    },
    schedules,
    recentAttendance,
  };
};

module.exports = { getDashboard };
const { Op } = require("sequelize");

const Student = require("../models/student");
const Schedule = require("../models/schedule");
const ClassSection = require("../models/class_section");
const AttendanceRecord = require("../models/AttendanceRecord");
const AttendanceSession = require("../models/AttendanceSession");
const Subject = require("../models/subject");
const Cohort = require("../models/cohort");
const getTeacherDashboard = async (teacherId) => {
  const today = new Date();

  // Convert day đúng format DB
  let dayOfWeek = today.getDay();

  // JS:
  // CN =0, T2=1...
  // DB:
  // T2=2, T3=3...
  if (dayOfWeek === 0) {
    dayOfWeek = 8; // nếu DB lưu CN = 8
  } else {
    dayOfWeek += 1;
  }

  console.log("Today DB day:", dayOfWeek);

  // Lấy lớp của giáo viên
  const classes = await ClassSection.findAll({
    where: {
      teacher_id: teacherId,
    },
    include: [
      {
        model: Subject,
        as: "subject",
      },
      {
        model: Student,
        as: "students",
        through: {
          attributes: [],
        },
      },
      {
        model: Schedule,
        as: "schedules",
      },
    ],
  });

  let totalStudents = 0;
  const todaySchedules = [];
  const classData = [];

  for (const cls of classes) {
    totalStudents += cls.students.length;

    // lịch hôm nay
    cls.schedules.forEach((schedule) => {
      if (schedule.dayOfWeek === dayOfWeek) {
        todaySchedules.push({
          id: schedule.id,
          subject: cls.subject?.name,
          class: cls.name,
          room: schedule.room,
          period: `Tiết ${schedule.startPeriod}-${schedule.endPeriod}`,
          status: "upcoming",
        });
      }
    });

    // attendance theo từng lớp
    const sessions = await AttendanceSession.findAll({
      include: [
        {
          model: AttendanceRecord,
          as: "records",
        },
        {
          model: Schedule,
          as: "schedule",
          where: {
            class_section_id: cls.id,
          },
        },
      ],
    });

    let classPresent = 0;
    let classTotal = 0;

    sessions.forEach((session) => {
      session.records.forEach((record) => {
        classTotal++;

        if (record.status === "present") {
          classPresent++;
        }
      });
    });

    const classAttendance =
      classTotal > 0 ? ((classPresent / classTotal) * 100).toFixed(1) : 0;

    classData.push({
      id: cls.id,
      name: cls.name,
      course: cls.subject?.name,
      students: cls.students.length,
      room: cls.room,
      attendanceRate: classAttendance,
    });
  }

  // attendance tổng
  let totalPresent = 0;
  let totalRecords = 0;

  classData.forEach((cls) => {
    totalPresent += Number(cls.attendanceRate) * cls.students;
    totalRecords += cls.students;
  });

  const attendanceAvg =
    totalRecords > 0 ? (totalPresent / totalRecords).toFixed(1) : 0;

  return {
    stats: {
      todaySessions: todaySchedules.length,
      totalStudents,
      attendanceAvg,
    },
    schedulesToday: todaySchedules,
    classes: classData,
  };
};

module.exports = {
  getTeacherDashboard,
};

module.exports = {
  getTeacherDashboard,
};

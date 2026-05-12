const { Op } = require("sequelize");

// Đảm bảo đường dẫn import Model của bạn chính xác (tuỳ theo kiến trúc thư mục)
const Student = require("../models/student");
const Schedule = require("../models/schedule");
const ClassSection = require("../models/class_section");
const AttendanceRecord = require("../models/AttendanceRecord");
const AttendanceSession = require("../models/AttendanceSession");
const Subject = require("../models/subject");
const Cohort = require("../models/cohort");
const Teacher = require("../models/teacher"); // Bổ sung import Teacher cho báo cáo lịch học

// ===== TOP STUDENTS =====
const getTopAbsentStudents = async () => {
  const totalSessions = await AttendanceSession.count();

  const students = await Student.findAll({
    attributes: ["id", "name", "studentCode"],
    include: [
      {
        model: AttendanceRecord,
        as: "attendanceRecords",
        attributes: ["status"],
      },
      {
        model: ClassSection,
        as: "classSections",
        attributes: ["name"],
        through: { attributes: [] },
      },
    ],
  });

  return students
    .map((s) => {
      let present = 0;

      (s.attendanceRecords || []).forEach((r) => {
        if (r.status === "present") present++;
      });

      const rate = totalSessions
        ? Math.round((present / totalSessions) * 100)
        : 0;

      return {
        id: s.id,
        name: s.name,
        studentId: s.studentCode,
        class: s.classSections?.[0]?.name || "N/A",
        avatar: s.name?.slice(0, 2),
        attendanceRate: rate,
      };
    })
    .sort((a, b) => a.attendanceRate - b.attendanceRate)
    .slice(0, 5);
};

// ===== CLASS STATS =====
const getAttendanceByClass = async () => {
  const classes = await ClassSection.findAll({
    include: [
      {
        model: Student,
        as: "students",
        include: [
          {
            model: AttendanceRecord,
            as: "attendanceRecords",
            attributes: ["status"],
          },
        ],
      },
      {
        model: Subject,
        as: "subject",
        attributes: ["name"],
      },
    ],
  });

  return classes.map((c) => {
    let present = 0;
    let total = 0;

    c.students.forEach((s) => {
      (s.attendanceRecords || []).forEach((r) => {
        total++;
        if (r.status === "present") present++;
      });
    });

    const rate = total ? Math.round((present / total) * 100) : 0;

    return {
      id: c.id,
      name: c.name,
      course: c.subject?.name || "",
      attendanceRate: rate,
    };
  });
};

// ===== BÁO CÁO SINH VIÊN (Chi tiết) =====
const getStudentReportData = async () => {
  const students = await Student.findAll({
    attributes: ["studentCode", "name"],
    include: [
      {
        model: ClassSection,
        as: "classSections",
        attributes: ["name"],
        through: { attributes: [] },
      },
      {
        model: AttendanceRecord,
        as: "attendanceRecords",
        attributes: ["status"],
      },
    ],
  });

  const totalSessions = await AttendanceSession.count();

  return students.map((s) => {
    let present = 0;
    (s.attendanceRecords || []).forEach((r) => {
      if (r.status === "present") present++;
    });

    const rate = totalSessions
      ? Math.round((present / totalSessions) * 100)
      : 0;

    return {
      studentCode: s.studentCode,
      name: s.name,
      class: s.classSections?.[0]?.name || "N/A",
      attendanceRate: rate,
    };
  });
};

// ===== BÁO CÁO LỊCH HỌC =====
const getScheduleReportData = async () => {
  const schedules = await Schedule.findAll({
    include: [
      {
        model: ClassSection,
        as: "classSection",
        attributes: ["name"],
        include: [
          {
            model: Teacher,
            as: "teacher",
            attributes: ["name"],
          },
        ],
      },
    ],
  });

  return schedules.map((s) => ({
    id: s.id,
    className: s.classSection?.name || "N/A",
    teacherName: s.classSection?.teacher?.name || "N/A",
    room: s.room,
    dayOfWeek: s.dayOfWeek,
    startPeriod: s.startPeriod,
    endPeriod: s.endPeriod,
  }));
};

// ===== MAIN =====
const getReportData = async () => {
  const topStudents = await getTopAbsentStudents();
  const classStats = await getAttendanceByClass();

  return { topStudents, classStats };
};

module.exports = {
  getReportData,
  getTopAbsentStudents,
  getAttendanceByClass,
  getStudentReportData,
  getScheduleReportData,
};

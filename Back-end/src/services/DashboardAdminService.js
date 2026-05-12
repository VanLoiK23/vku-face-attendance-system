const { Op } = require("sequelize");

const Student = require("../models/student");
const Schedule = require("../models/schedule");
const ClassSection = require("../models/class_section");
const AttendanceRecord = require("../models/AttendanceRecord");
const AttendanceSession = require("../models/AttendanceSession");
const Subject = require("../models/subject");
const Cohort = require("../models/cohort");

// ===== convert period → time =====
const convertPeriodToTime = (start, end) => {
  const baseHour = 7;
  const calc = (p) => baseHour + (p - 1) * 0.833;

  const format = (h) => {
    const hour = Math.floor(h);
    const minute = Math.round((h - hour) * 60);
    return `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  };

  return `${format(calc(start))} - ${format(calc(end))}`;
};

const getDashboardData = async () => {
  // ===== STATS =====
  const totalStudents = await Student.count();
  const totalClasses = await ClassSection.count();

  const todayStr = new Date().toISOString().split("T")[0];

  const todaySessions = await AttendanceSession.count({
    where: { sessionDate: todayStr },
  });

  const totalRecords = await AttendanceRecord.count();
  const presentRecords = await AttendanceRecord.count({
    where: { status: "present" },
  });

  const avgAttendance = totalRecords
    ? Math.round((presentRecords / totalRecords) * 100)
    : 0;

  // ===== LẤY TỔNG SESSION (QUAN TRỌNG) =====
  const totalSessionsAll = await AttendanceSession.count();

  // ===== STUDENTS =====
  const students = await Student.findAll({
    attributes: ["id", "name", "studentCode", "faceStatus"],
    include: [
      {
        model: AttendanceRecord,
        as: "attendanceRecords",
        attributes: ["status"],
      },
      {
        model: Cohort,
        as: "cohort",
        attributes: ["name"],
      },
    ],
  });

  const studentsList = students
    .map((s) => {
      let present = 0;
      let absent = 0;

      (s.attendanceRecords || []).forEach((r) => {
        if (r.status === "present") present++;
        if (r.status === "absent") absent++;
      });

      // 👉 FIX CỐT LÕI
      const totalSessions = totalSessionsAll;

      return {
        id: s.id,
        name: s.name,
        studentId: s.studentCode,
        class: s.cohort?.name || "N/A",

        totalSessions,
        absentSessions: totalSessions - present, // 🔥 FIX CHUẨN

        attendanceRate: totalSessions
          ? Math.round((present / totalSessions) * 100)
          : 0,

        faceStatus: s.faceStatus,
        avatar: s.name?.slice(0, 2),
      };
    })
    .sort((a, b) => a.attendanceRate - b.attendanceRate)
    .slice(0, 5);

  // ===== SCHEDULE =====
  const dayMap = { 0: 8, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7 };
  const currentDbDay = dayMap[new Date().getDay()];
  const currentHour = new Date().getHours();

  const schedules = await Schedule.findAll({
    where: { dayOfWeek: currentDbDay },
    include: [
      {
        model: ClassSection,
        as: "classSection",
        include: [{ model: Subject, as: "subject" }],
      },
    ],
  });

  const scheduleToday = schedules.map((s) => {
    const startHour = 7 + (s.startPeriod - 1) * 0.833;

    let status = "upcoming";
    if (currentHour >= startHour && currentHour <= startHour + 2)
      status = "ongoing";
    else if (currentHour > startHour + 2) status = "done";

    return {
      id: s.id,
      subject: s.classSection.subject.name,
      class: s.classSection.name,
      room: s.room,
      time: convertPeriodToTime(s.startPeriod, s.endPeriod),
      status,
    };
  });

  // ===== CHART =====
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

  const sessions = await AttendanceSession.findAll({
    where: {
      sessionDate: {
        [Op.gte]: sevenDaysAgoStr,
      },
    },
    include: [
      { model: AttendanceRecord, as: "records", attributes: ["status"] },
    ],
  });

  const map = {};

  sessions.forEach((s) => {
    const key = s.sessionDate;

    if (!map[key]) map[key] = { total: 0, present: 0 };

    map[key].total += s.records.length;
    map[key].present += s.records.filter((r) => r.status === "present").length;
  });

  const chartData = Object.keys(map)
    .sort()
    .map((date) => ({
      label: new Date(date).toLocaleDateString("vi-VN", {
        weekday: "short",
      }),
      value: map[date].total
        ? Math.round((map[date].present / map[date].total) * 100)
        : 0,
    }));

  return {
    stats: { totalStudents, totalClasses, todaySessions, avgAttendance },
    students: studentsList,
    scheduleToday,
    chartData,
  };
};
// ===== ALL STUDENTS =====
const getAllStudentsService = async () => {
  const totalSessionsAll = await AttendanceSession.count();

  const students = await Student.findAll({
    attributes: ["id", "name", "studentCode", "faceStatus"],
    include: [
      {
        model: AttendanceRecord,
        as: "attendanceRecords",
        attributes: ["status"],
      },
      {
        model: Cohort,
        as: "cohort",
        attributes: ["name"],
      },
    ],
  });

  return students.map((s) => {
    let present = 0;

    (s.attendanceRecords || []).forEach((r) => {
      if (r.status === "present") present++;
    });

    return {
      id: s.id,
      name: s.name,
      studentId: s.studentCode,
      class: s.cohort?.name || "N/A",
      totalSessions: totalSessionsAll,
      absentSessions: totalSessionsAll - present,
      attendanceRate: totalSessionsAll
        ? Math.round((present / totalSessionsAll) * 100)
        : 0,
      faceStatus: s.faceStatus,
    };
  });
};

// ===== STUDENT DETAIL =====
const getStudentDetailService = async (studentId) => {
  const student = await Student.findByPk(studentId, {
    attributes: ["id", "name", "studentCode", "faceStatus"],
    include: [
      {
        model: AttendanceRecord,
        as: "attendanceRecords",
        include: [
          {
            model: AttendanceSession,
            as: "session",
            attributes: ["sessionDate"],
          },
        ],
      },
      {
        model: Cohort,
        as: "cohort",
        attributes: ["name"],
      },
    ],
  });

  if (!student) return null;

  let present = 0;
  let absent = 0;

  const history = (student.attendanceRecords || []).map((r) => {
    if (r.status === "present") present++;
    else absent++;

    return {
      date: r.session?.sessionDate,
      status: r.status,
    };
  });

  const total = present + absent;

  return {
    id: student.id,
    name: student.name,
    studentId: student.studentCode,
    class: student.cohort?.name || "N/A",

    totalSessions: total,
    present,
    absent,
    attendanceRate: total ? Math.round((present / total) * 100) : 0,

    history,
  };
};

module.exports = {
  getDashboardData,
  getAllStudentsService,
  getStudentDetailService,
};

const Student = require("../models/student");
const Teacher = require("../models/teacher");
const Schedule = require("../models/schedule");
const ClassSection = require("../models/class_section");
const Subject = require("../models/subject");
const Semester = require("../models/semester");

const { Op } = require("sequelize");

// ===============================
// TÍNH TUẦN HỌC
// ===============================
const calculateCurrentWeek = (semesterStartDate) => {
  const start = new Date(semesterStartDate);

  start.setHours(0, 0, 0, 0);

  const now = new Date();

  now.setHours(0, 0, 0, 0);

  const diffTime = now - start;

  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // fix week âm
  return Math.max(1, Math.floor(diffDays / 7) + 1);
};

const emptySchedule = {
  T2: [],
  T3: [],
  T4: [],
  T5: [],
  T6: [],
  T7: [],
  CN: [],
};

const getWeekSchedule = async (userId, role, requestWeek) => {
  let classIds = [];

  // ===============================
  // HỌC KỲ ACTIVE
  // ===============================
  const semester = await Semester.findOne({
    where: {
      is_active: true,
    },
  });

  if (!semester) {
    throw new Error("Semester not found");
  }

  // ===============================
  // WEEK
  // ===============================
  let currentWeek = requestWeek || calculateCurrentWeek(semester.start_date);

  // validate
  if (currentWeek < 1 || currentWeek > 60) {
    throw new Error("Invalid week");
  }

  // ===============================
  // TEACHER
  // ===============================
  if (role === "teacher") {
    const teacher = await Teacher.findOne({
      where: {
        user_id: userId,
      },
    });

    if (!teacher) {
      throw new Error("Teacher not found");
    }

    const sections = await ClassSection.findAll({
      where: {
        teacher_id: teacher.id,
      },
    });

    classIds = sections.map((s) => s.id);
  }

  // ===============================
  // STUDENT
  // ===============================
  else {
    const student = await Student.findOne({
      where: {
        user_id: userId,
      },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    const sections = await student.getClassSections();

    classIds = sections.map((s) => s.id);
  }

  // ===============================
  // KHÔNG CÓ LỚP
  // ===============================
  if (classIds.length === 0) {
    return {
      week: currentWeek,
      semester: semester.name,
      semesterStartDate: semester.start_date,
      schedule: emptySchedule,
    };
  }

  // ===============================
  // QUERY SCHEDULE
  // ===============================
  const schedules = await Schedule.findAll({
    where: {
      class_section_id: {
        [Op.in]: classIds,
      },

      weekStart: {
        [Op.lte]: currentWeek,
      },

      weekEnd: {
        [Op.gte]: currentWeek,
      },
    },

    include: [
      {
        model: ClassSection,
        as: "classSection",
        attributes: ["name"],

        include: [
          {
            model: Subject,
            as: "subject",
            attributes: ["name", "credits"],
          },
        ],
      },
    ],

    order: [
      ["day_of_week", "ASC"],
      ["start_period", "ASC"],
    ],
  });

  // ===============================
  // FORMAT
  // ===============================
  const weekData = {
    T2: [],
    T3: [],
    T4: [],
    T5: [],
    T6: [],
    T7: [],
    CN: [],
  };

  const mapDay = {
    2: "T2",
    3: "T3",
    4: "T4",
    5: "T5",
    6: "T6",
    7: "T7",
    8: "CN",
  };

  schedules.forEach((s) => {
    const item = s.get({ plain: true });

    const dayKey = mapDay[item.dayOfWeek || item.day_of_week];

    if (!dayKey) return;

    const subjectName =
      item.classSection?.subject?.name || item.classSection?.name || "N/A";

    const credits = item.classSection?.subject?.credits
      ? ` (${item.classSection.subject.credits})`
      : "";

    weekData[dayKey].push({
      id: item.id,

      startPeriod: Number(item.startPeriod || item.start_period),

      endPeriod: Number(item.endPeriod || item.end_period),

      subject: subjectName + credits,

      room: item.room || "N/A",

      weekStart: item.weekStart || item.week_start,

      weekEnd: item.weekEnd || item.week_end,
    });
  });

  return {
    week: currentWeek,

    semester: semester.name,

    semesterStartDate: semester.start_date,

    schedule: weekData,
  };
};

module.exports = {
  getWeekSchedule,
};

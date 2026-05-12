const Student = require("../models/student");
const User = require("../models/user");
const Schedule = require("../models/schedule");
const ClassSection = require("../models/class_section");
const AttendanceRecord = require("../models/AttendanceRecord");
const AttendanceSession = require("../models/AttendanceSession");
const Semester = require("../models/semester");
const Subject = require("../models/subject");
const Cohort = require("../models/cohort");

const { Op } = require("sequelize");

// ======================================
// CALCULATE CURRENT WEEK
// ======================================
const calculateCurrentWeek = (semesterStartDate) => {
  const start = new Date(semesterStartDate);

  start.setHours(0, 0, 0, 0);

  const now = new Date();

  now.setHours(0, 0, 0, 0);

  const diffTime = now - start;

  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(1, Math.floor(diffDays / 7) + 1);
};

const getDashboard = async (userId) => {
  if (!userId) {
    throw new Error("userId is required");
  }

  const student = await Student.findOne({
    where: {
      user_id: userId,
    },

    include: [
      {
        model: User,
        as: "user",
        attributes: ["email"],
      },

      {
        model: Cohort,
        as: "cohort",
        attributes: ["id", "name"],
      },

      {
        model: ClassSection,
        as: "classSections",
        attributes: ["id", "name", "room"],

        through: {
          attributes: [],
        },

        include: [
          {
            model: Subject,
            as: "subject",
            attributes: ["id", "name", "credits"],
          },
        ],
      },
    ],
  });

  if (!student) {
    throw new Error("Student not found");
  }

  const semester = await Semester.findOne({
    where: {
      is_active: true,
    },
  });

  if (!semester) {
    throw new Error("Semester not found");
  }

  const currentWeek = calculateCurrentWeek(semester.start_date);

  const classIds = student.classSections?.map((c) => c.id) || [];

  const now = new Date();

  let dayOfWeek = now.getDay();

  if (dayOfWeek === 0) {
    dayOfWeek = 8;
  } else {
    dayOfWeek += 1;
  }

  let schedules = [];

  if (classIds.length > 0) {
    schedules = await Schedule.findAll({
      where: {
        class_section_id: {
          [Op.in]: classIds,
        },

        dayOfWeek,

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

          attributes: ["id", "name", "room"],

          include: [
            {
              model: Subject,
              as: "subject",
              attributes: ["id", "name", "credits"],
            },
          ],
        },
      ],

      order: [["startPeriod", "ASC"]],
    });
  }

  // ======================================
  // RECENT ATTENDANCE
  // ======================================
  const recentAttendance = await AttendanceRecord.findAll({
    where: {
      student_id: student.id,
    },

    limit: 5,

    order: [["id", "DESC"]],

    include: [
      {
        model: AttendanceSession,
        as: "session",

        attributes: ["id", "sessionDate"],

        include: [
          {
            model: Schedule,
            as: "schedule",

            attributes: ["id", "startPeriod", "endPeriod", "room"],

            include: [
              {
                model: ClassSection,
                as: "classSection",

                attributes: ["id", "name", "room"],

                include: [
                  {
                    model: Subject,
                    as: "subject",

                    attributes: ["id", "name", "credits"],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });

  // ======================================
  // STATS
  // ======================================
  const totalPresent = await AttendanceRecord.count({
    where: {
      student_id: student.id,
      status: "present",
    },
  });

  const totalAbsent = await AttendanceRecord.count({
    where: {
      student_id: student.id,
      status: "absent",
    },
  });

  const total = totalPresent + totalAbsent;

  return {
    student,

    semester: {
      id: semester.id,
      name: semester.name,
      startDate: semester.start_date,
      currentWeek,
    },

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

module.exports = {
  getDashboard,
};

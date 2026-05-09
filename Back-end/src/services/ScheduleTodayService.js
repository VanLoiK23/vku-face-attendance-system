const Student = require("../models/student");
const Teacher = require("../models/teacher");
const Schedule = require("../models/schedule");
const ClassSection = require("../models/class_section");
const Subject = require("../models/subject");

const { Op } = require("sequelize");

const getTodaySchedule = async (userId, role) => {

  const now = new Date();

  // Monday = 2 ... Sunday = 8
  const dayOfWeekToday =
    now.getDay() === 0 ? 8 : now.getDay() + 1;

  let schedules = [];

  // ================= STUDENT =================

  if (role === "student") {

    const student = await Student.findOne({
      where: { user_id: userId },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    const classSections =
      await student.getClassSections();

    const classIds = classSections.map((c) => c.id);

    if (classIds.length === 0) {
      return [];
    }

    schedules = await Schedule.findAll({
      where: {
        dayOfWeek: dayOfWeekToday,
        class_section_id: {
          [Op.in]: classIds,
        },
      },

      include: [
        {
          model: ClassSection,
          as: "classSection",
          include: [
            {
              model: Subject,
              as: "subject",
              attributes: ["id", "name"],
            },
          ],
        },
      ],

      order: [["startPeriod", "ASC"]],
    });
  }

  // ================= TEACHER =================

  else if (role === "teacher") {

    const teacher = await Teacher.findOne({
      where: { user_id: userId },
    });

    if (!teacher) {
      throw new Error("Teacher not found");
    }

    schedules = await Schedule.findAll({
      where: {
        dayOfWeek: dayOfWeekToday,
      },

      include: [
        {
          model: ClassSection,
          as: "classSection",

          where: {
            teacher_id: teacher.id,
          },

          include: [
            {
              model: Subject,
              as: "subject",
              attributes: ["id", "name"],
            },
          ],
        },
      ],

      order: [["startPeriod", "ASC"]],
    });
  }

  // ================= INVALID ROLE =================

  else {
    throw new Error("Invalid role");
  }

  // ================= FORMAT DATA =================

  const currentHour = now.getHours();

  return schedules.map((s) => {

    const item = s.get({ plain: true });

    let status = "upcoming";

    if (item.startPeriod <= 6) {

      if (currentHour >= 12) {
        status = "done";
      }

      else if (currentHour >= 7) {
        status = "ongoing";
      }

    } else {

      if (currentHour >= 18) {
        status = "done";
      }

      else if (currentHour >= 13) {
        status = "ongoing";
      }
    }

    return {
      id: item.id,

      time: `${item.startPeriod}-${item.endPeriod}`,

      subject:
        item.classSection?.subject?.name ||
        "Unknown Subject",

      class:
        item.classSection?.name ||
        "Unknown Class",

      room: item.room || "N/A",

      period: `Tiết ${item.startPeriod}-${item.endPeriod}`,

      startPeriod: item.startPeriod,

      endPeriod: item.endPeriod,

      status,
    };
  });
};

module.exports = {
  getTodaySchedule,
};
const Student = require("../models/student");
const Schedule = require("../models/schedule");
const ClassSection = require("../models/class_section");
const { Op } = require("sequelize");

const getWeekSchedule = async (userId) => {
  const student = await Student.findOne({
    where: { user_id: userId },
  });

  if (!student) throw new Error("Student not found");

  const classSections = await student.getClassSections();
  const classIds = classSections.map((c) => c.id);

  const schedules = await Schedule.findAll({
    where: {
      class_section_id: { [Op.in]: classIds },
    },
    include: [
      {
        model: ClassSection,
        as: "classSection",
        attributes: ["id", "name"],
      },
    ],
  });

  // format về dạng tuần
  const week = {
    T2: [],
    T3: [],
    T4: [],
    T5: [],
    T6: [],
    T7: [],
  };

  const mapDay = {
    2: "T2",
    3: "T3",
    4: "T4",
    5: "T5",
    6: "T6",
    7: "T7",
    8: "T7",
  };

  schedules.forEach((s) => {
    const day = mapDay[s.day_of_week];
    if (!day) return;

    week[day].push({
      period: `${s.start_period}-${s.end_period}`,
      subject: s.classSection?.name,
      class: s.classSection?.name,
      room: s.room,
    });
  });

  return week;
};

module.exports = { getWeekSchedule };
const Student = require("../models/student");
const Schedule = require("../models/schedule");
const ClassSection = require("../models/class_section");
const AttendanceSession = require("../models/AttendanceSession");
const { Op } = require("sequelize");

const getTodaySchedule = async (userId) => {
  const student = await Student.findOne({
    where: { user_id: userId },
  });

  if (!student) throw new Error("Student not found");

  const classIds = await student.getClassSections().then((res) =>
    res.map((c) => c.id)
  );

  const now = new Date();
  const dayOfWeek = now.getDay() === 0 ? 8 : now.getDay() + 1;

  const schedules = await Schedule.findAll({
    where: {
      day_of_week: dayOfWeek,
      class_section_id: { [Op.in]: classIds },
    },
    include: [
      {
        model: ClassSection,
        as: "classSection",
        attributes: ["id", "name"],
      },
    ],
    order: [["start_period", "ASC"]],
  });

  const data = schedules.map((s) => {
    let status = "upcoming";

    const currentHour = now.getHours();

    if (currentHour >= 13) status = "done";
    else if (currentHour >= 9) status = "ongoing";

    return {
      id: s.id,
      time: `${s.start_period} - ${s.end_period}`,
      subject: s.classSection?.name || "Unknown",
      class: s.classSection?.name,
      room: s.room,
      period: `Tiết ${s.start_period}-${s.end_period}`,
      status,
    };
  });

  return data;
};

module.exports = { getTodaySchedule };
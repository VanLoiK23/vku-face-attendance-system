const Student = require("../models/student");
const Teacher = require("../models/teacher");
const Schedule = require("../models/schedule");
const ClassSection = require("../models/class_section");
const Subject = require("../models/subject");

const { Op } = require("sequelize");

const getTodaySchedule = async (userId, role) => {
  const now = new Date();

  // Monday = 2 ... Sunday = 8 (suitable with format in DB)
  const dayOfWeekToday = now.getDay() === 0 ? 8 : now.getDay() + 1;

  let schedules = [];

  // ================= STUDENT =================

  if (role === "student") {
    const student = await Student.findOne({
      where: { user_id: userId },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    const classSections = await student.getClassSections();

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
  else {
    throw new Error("Invalid role");
  }

  // ================= FORMAT DATA =================

  // Tính tổng số phút kể từ 00:00 của thời điểm hiện tại
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return schedules.map((s) => {
    const item = s.get({ plain: true });

    // Định nghĩa khung giờ bắt đầu của các tiết (quy đổi ra phút)
    // Tiết 1: 07h30 = 7*60 + 30 = 450 phút
    const periodTimes = {
      1: 450, // 07:30
      2: 510, // 08:30
      3: 570, // 09:30
      4: 630, // 10:30
      5: 690, // 11:30
      6: 780, // 13:00
      7: 840, // 14:00
      8: 900, // 15:00
      9: 960, // 16:00
      10: 1020, // 17:00
    };

    // mỗi tiết kéo dài 50 phút.
    const startMinutes = periodTimes[item.startPeriod];
    const endMinutes = periodTimes[item.endPeriod] + 60; // kéo dài thêm 10 phút nghỉ tiết

    let status = "upcoming";

    if (currentMinutes >= endMinutes) {
      status = "done"; 
    } else if (currentMinutes >= startMinutes) {
      status = "ongoing"; 
    }

    return {
      id: item.id,
      time: `${item.startPeriod}-${item.endPeriod}`,
      subject: item.classSection?.subject?.name || "Unknown Subject",
      class: item.classSection?.name || "Unknown Class",
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

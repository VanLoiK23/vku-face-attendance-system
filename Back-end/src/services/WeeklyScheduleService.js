const Student = require("../models/student");
const Teacher = require("../models/teacher");
const Schedule = require("../models/schedule");
const ClassSection = require("../models/class_section");
const { Op } = require("sequelize");

const getWeekSchedule = async (userId, role) => {
  let classIds = [];

  // 1. Xác định danh sách lớp theo Role
  if (role === 'teacher') {
    const teacher = await Teacher.findOne({ where: { user_id: userId } });
    if (!teacher) throw new Error("Teacher not found");
    const sections = await ClassSection.findAll({ where: { teacher_id: teacher.id } });
    classIds = sections.map(s => s.id);
  } else {
    const student = await Student.findOne({ where: { user_id: userId } });
    if (!student) throw new Error("Student not found");
    const sections = await student.getClassSections();
    classIds = sections.map(s => s.id);
  }

  if (classIds.length === 0) return {};

  // 2. Truy vấn tất cả lịch học của các lớp này
  const schedules = await Schedule.findAll({
    where: { class_section_id: { [Op.in]: classIds } },
    include: [{ model: ClassSection, as: "classSection", attributes: ["name"] }],
    order: [["startPeriod", "ASC"]],
  });

  // 3. Format dữ liệu trả về theo các thứ trong tuần
  const week = { T2: [], T3: [], T4: [], T5: [], T6: [], T7: [], CN: [] };
  const mapDay = { 2: "T2", 3: "T3", 4: "T4", 5: "T5", 6: "T6", 7: "T7", 8: "CN" };

  schedules.forEach((s) => {
    const item = s.get({ plain: true });
    const dayKey = mapDay[item.dayOfWeek];
    if (!dayKey) return;

    week[dayKey].push({
      id: item.id,
      startPeriod: item.startPeriod,
      endPeriod: item.endPeriod,
      // Tạo format period để khớp với frontend hoặc dùng để so sánh
      period: `${item.startPeriod}-${item.endPeriod}`, 
      time: `${item.startTime?.substring(0, 5)} - ${item.endTime?.substring(0, 5)}`,
      subject: item.classSection?.name,
      room: item.room || "N/A",
    });
  });

  return week;
};

module.exports = { getWeekSchedule };
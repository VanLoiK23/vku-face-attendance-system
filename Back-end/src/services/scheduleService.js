const Schedule = require("../models/schedule");
const ClassSection = require("../models/class_section");
const Subject = require("../models/subject");
const Teacher = require("../models/teacher");
const Semester = require("../models/semester"); // Nhớ import thêm model này
const { Op } = require("sequelize");
const AttendanceSession = require("../models/AttendanceSession");
const Student = require("../models/student");
const AttendanceRecord = require("../models/AttendanceRecord");

const scheduleService = {
  create: async (data) => {
    const {
      day_of_week,
      start_period,
      end_period,
      week_start,
      week_end,
      room,
      semester_id,
      class_section_id,
    } = data;

    if (start_period > end_period)
      throw new Error("Tiết bắt đầu không được lớn hơn tiết kết thúc");
    if (week_start > week_end)
      throw new Error("Tuần bắt đầu không được lớn hơn tuần kết thúc");
    if (week_start < 1 || week_end > 20)
      throw new Error("Tuần học phải từ 1 đến 20");
    if (start_period < 1 || end_period > 10)
      throw new Error("Tiết học phải từ 1 đến 10");

    // (Conflict Detection)
    // Cùng Học kỳ + Cùng Thứ + Giao thoa Tiết + Giao thoa Tuần + Cùng Phòng => trùng
    const conflict = await Schedule.findOne({
      where: {
        semester_id,
        dayOfWeek: day_of_week,
        room,
        [Op.and]: [
          // Kiểm tra giao thoa tiết học: (Start1 <= End2) AND (End1 >= Start2)
          { startPeriod: { [Op.lte]: end_period } },
          { endPeriod: { [Op.gte]: start_period } },
          // Kiểm tra giao thoa tuần học: (WStart1 <= WEnd2) AND (WEnd1 >= WStart2)
          { weekStart: { [Op.lte]: week_end } },
          { weekEnd: { [Op.gte]: week_start } },
        ],
      },
      include: [
        { model: ClassSection, as: "classSection", attributes: ["name"] },
      ],
    });

    if (conflict) {
      throw new Error(
        `Phòng ${room} đã được dùng bởi lớp "${conflict.classSection?.name}" ` +
          `vào tiết ${conflict.start_period}-${conflict.end_period}, tuần ${conflict.week_start}-${conflict.week_end}`
      );
    }

    const createData = {
      dayOfWeek: day_of_week,
      startPeriod: start_period,
      endPeriod: end_period,
      weekStart: week_start,
      weekEnd: week_end,
      room: room,
      semester_id,
      class_section_id,
    };

    // Nếu mọi thứ OK thì mới tạo
    return await Schedule.create(createData);
  },

  getAll: async () => {
    return await Schedule.findAll({
      include: [
        {
          model: Semester,
          as: "semester",
          attributes: ["id", "name", "start_date", "is_active"],
        },
        {
          model: ClassSection,
          as: "classSection",
          attributes: ["id", "name", "room"],
          include: [
            { model: Subject, as: "subject", attributes: ["name", "code"] },
            { model: Teacher, as: "teacher", attributes: ["name"] },
          ],
        },
      ],
      order: [
        ["semester_id", "DESC"], // Hiện học kỳ mới nhất lên đầu
        ["day_of_week", "ASC"],
        ["start_period", "ASC"],
      ],
    });
  },

  getById: async (id) => {
    const today = new Date().toISOString().split("T")[0];

    return await Schedule.findByPk(id, {
      include: [
        {
          model: AttendanceSession,
          as: "sessions",
          attributes: ["id", "sessionDate"],
          where: { sessionDate: today },
          required: false, // chưa có session hôm nay vẫn trả về Schedule
          include: [
            {
              model: AttendanceRecord,
              as: "records",
              where: { status: { [Op.ne]: "absent" } }, // Chỉ lấy PRESENT/LATE
              required: false,
              include: [
                {
                  model: Student,
                  as: "student",
                  attributes: ["id", "studentCode", "name"],
                },
              ],
            },
          ],
        },
        {
          model: ClassSection,
          as: "classSection",
          attributes: ["id", "name", "room"],
          include: [
            {
              model: Student,
              as: "students",
              attributes: ["id", "name", "studentCode"],
              through: { attributes: [] },
            },
            { model: Subject, as: "subject", attributes: ["name", "code"] },
            { model: Teacher, as: "teacher", attributes: ["id", "name"] },
          ],
        },
      ],
      order: [
        [
          { model: ClassSection, as: "classSection" },
          { model: Student, as: "students" },
          "name",
          "ASC",
        ],
      ],
    });
  },

  update: async (id, data) => {
    const {
      day_of_week,
      start_period,
      end_period,
      week_start,
      week_end,
      room,
      semester_id,
      class_section_id,
    } = data;

    if (start_period > end_period)
      throw new Error("Tiết bắt đầu không được lớn hơn tiết kết thúc");
    if (week_start > week_end)
      throw new Error("Tuần bắt đầu không được lớn hơn tuần kết thúc");
    if (week_start < 1 || week_end > 20)
      throw new Error("Tuần học phải từ 1 đến 20");
    if (start_period < 1 || end_period > 10)
      throw new Error("Tiết học phải từ 1 đến 10");

    const conflict = await Schedule.findOne({
      where: {
        id: { [Op.ne]: id },
        semester_id,
        day_of_week,
        room,
        [Op.and]: [
          // Kiểm tra giao thoa tiết học: (Start1 <= End2) AND (End1 >= Start2)
          { startPeriod: { [Op.lte]: end_period } },
          { endPeriod: { [Op.gte]: start_period } },
          // Kiểm tra giao thoa tuần học: (WStart1 <= WEnd2) AND (WEnd1 >= WStart2)
          { weekStart: { [Op.lte]: week_end } },
          { weekEnd: { [Op.gte]: week_start } },
        ],
      },
    });

    if (conflict) {
      throw new Error(
        "Cập nhật thất bại: Khung giờ và tuần học này đã có lớp khác đăng ký phòng."
      );
    }

    const updateData = {
      dayOfWeek: day_of_week,
      startPeriod: start_period,
      endPeriod: end_period,
      weekStart: week_start,
      weekEnd: week_end,
      room: room,
      semester_id,
      class_section_id,
    };

    return await Schedule.update(updateData, { where: { id } });
  },

  delete: async (id) => {
    return await Schedule.destroy({ where: { id } });
  },
};

module.exports = scheduleService;

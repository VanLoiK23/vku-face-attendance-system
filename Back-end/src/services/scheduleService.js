const Schedule = require("../models/schedule");
const ClassSection = require("../models/class_section");
const Subject = require("../models/subject");
const Teacher = require("../models/teacher");

const scheduleService = {
  create: async (data) => {
    const { day_of_week, start_period, end_period, room, class_section_id } =
      data;

    // 1. Check (Conflict Detection)
    const conflict = await Schedule.findOne({
      where: {
        day_of_week,
        room,
        [Op.or]: [
          { start_period: { [Op.between]: [start_period, end_period] } },
          { end_period: { [Op.between]: [start_period, end_period] } },
          {
            [Op.and]: [
              { start_period: { [Op.lte]: start_period } },
              { end_period: { [Op.gte]: end_period } },
            ],
          },
        ],
      },
    });

    if (conflict) {
      throw new Error(
        `Xung đột lịch: Phòng ${room} đã được sử dụng từ tiết ${conflict.start_period} đến ${conflict.end_period}`
      );
    }

    // 2. OK then create
    return await Schedule.create(data);
  },
  getAll: async () => {
    return await Schedule.findAll({
      include: [
        {
          model: ClassSection,
          as: "class_section",
          attributes: ["id", "name", "room"],
          include: [
            {
              model: Subject,
              attributes: ["name", "code"],
            },
            {
              model: Teacher,
              attributes: ["name"],
            },
          ],
        },
      ],
      order: [
        ["day_of_week", "ASC"],
        ["start_period", "ASC"],
      ],
    });
  },
  update: async (id, data) => {
    const { day_of_week, start_period, end_period, room } = data;

    // Kiểm tra trùng lịch nhưng bỏ qua ID hiện tại
    const conflict = await Schedule.findOne({
      where: {
        id: { [Op.ne]: id }, // Không bao gồm chính nó (Not Equal)
        day_of_week,
        room,
        [Op.or]: [
          { start_period: { [Op.between]: [start_period, end_period] } },
          { end_period: { [Op.between]: [start_period, end_period] } },
        ],
      },
    });

    if (conflict) {
      throw new Error(
        "Lịch cập nhật bị trùng với một lịch học khác đã tồn tại!"
      );
    }

    return await Schedule.update(data, {
      where: { id },
    });
  },
  delete: async (id) => {
    const schedule = await Schedule.findByPk(id);
    if (!schedule) {
      throw new Error("Không tìm thấy lịch học cần xóa");
    }

    return await Schedule.destroy({
      where: { id },
    });
  },

  getByDay: async (day) =>
    await Schedule.findAll({
      where: { day_of_week: day },
      include: [{ model: ClassSection, attributes: ["name", "room"] }],
    }),

  getByClass: async (classId) =>
    await Schedule.findAll({
      where: { class_id: classId },
    }),
};

module.exports = scheduleService;

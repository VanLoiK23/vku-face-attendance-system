const Semester = require("../models/semester");
const { Op } = require("sequelize");

const semesterService = {
  create: async (data) => {
    // Tự động tắt các học kỳ khác đang có kì học là true
    if (data.is_active) {
      await Semester.update({ is_active: false }, { where: { is_active: true } });
    }
    return await Semester.create(data);
  },

  getAll: async () => {
    return await Semester.findAll({
      order: [["start_date", "DESC"]],
    });
  },

  getById: async (id) => {
    return await Semester.findByPk(id);
  },

  getActiveSemester: async () => {
    return await Semester.findOne({ where: { is_active: true } });
  },

  update: async (id, data) => {
    // Nếu cập nhật học kỳ này thành active, tắt các cái khác
    if (data.is_active) {
      await Semester.update({ is_active: false }, { 
        where: { 
          is_active: true,
          id: { [Op.ne]: id } 
        } 
      });
    }
    return await Semester.update(data, { where: { id } });
  },

  delete: async (id) => {
    return await Semester.destroy({ where: { id } });
  },
};

module.exports = semesterService;
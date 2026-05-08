const Subject = require("../models/subject");
const ClassSection = require("../models/class_section");

const subjectService = {
  create: async (data) => {
    return await Subject.create(data);
  },

  getAll: async () => {
    return await Subject.findAll({
      include: [
        {
          model: ClassSection,
          as: "sections",
          attributes: ["id", "name", "room"],
        },
      ],
    });
  },

  getDetails: async (id) => {
    return await Subject.findByPk(id, {
      include: [
        {
          model: ClassSection,
          as: "sections",
          attributes: ["id", "name", "room"],
        },
      ],
    });
  },

  update: async (id, data) => {
    return await Subject.update(data, {
      where: { id },
    });
  },

  delete: async (id) => {
    return await Subject.destroy({
      where: { id },
    });
  },
};

module.exports = subjectService;
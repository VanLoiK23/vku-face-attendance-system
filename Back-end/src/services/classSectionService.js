const ClassSection = require("../models/class_section");
const Teacher = require("../models/teacher");
const Student = require("../models/student");
const Subject = require("../models/subject");
const Cohort = require("../models/cohort");

const classSectionService = {
  create: async (data) => {
    return await ClassSection.create(data);
  },

  getAll: async () => {
    return await ClassSection.findAll({
      include: [
        {
          model: Teacher,
          as: "teacher",
          attributes: ["id", "name"],
        },
        {
          model: Subject,
          as: "subject",
          attributes: ["id", "name", "code"],
        },
        {
          model: Student,
          as: "students",
          attributes: ["id", "studentCode", "name", "faceStatus"],
          through: { attributes: [] }, //hidden bảng trung gian
        },
      ],
    });
  },

  getDetails: async (id) => {
    return await ClassSection.findByPk(id, {
      include: [
        {
          model: Teacher,
          as: "teacher",
          attributes: ["id", "name"],
        },

        {
          model: Subject,
          as: "subject",
          attributes: ["id", "name", "code"],
        },

        {
          model: Student,
          as: "students",

          through: {
            attributes: [],
          },

          attributes: [
            "id",
            "studentCode",
            "name",
            "faceStatus",
          ],

          include: [
            {
              model: Cohort,
              as: "cohort",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });
  },

  update: async (id, data) => {
    return await ClassSection.update(data, {
      where: { id },
    });
  },

  delete: async (id) => {
    return await ClassSection.destroy({
      where: { id },
    });
  },
};

module.exports = classSectionService;
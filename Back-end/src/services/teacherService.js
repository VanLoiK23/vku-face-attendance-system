const Teacher = require("../models/teacher");
const User = require("../models/user");
const ClassSection = require("../models/class_section");

const { fn, col } = require("sequelize");

const teacherService = {
  create: async (data, t) => {
    return await Teacher.create(data, {
      transaction: t,
    });
  },

  getAll: async () => {
    return await Teacher.findAll({
      attributes: [
        "id",
        "name",

        [fn("COUNT", col("sections.id")), "classSectionCount"],
      ],

      include: [
        {
          model: User,
          as: "user",
          attributes: ["email", "role", "id"],
        },

        {
          model: ClassSection,
          as: "sections",
          attributes: [],
        },
      ],

      group: ["Teacher.id", "user.id"],

      order: [["id", "ASC"]],
    });
  },

  getById: async (id) => {
    return await Teacher.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["email"],
        },

        {
          model: ClassSection,
          as: "sections",

          attributes: ["id", "name", "room"],

          include: [
            {
              model: Subject,
              as: "subject",
              attributes: ["id", "name", "code"],
            },
          ],
        },
      ],
    });
  },

  update: async (id, data, t) => {
    return await Teacher.update(
      data,
      {
        where: { id },
        transaction: t 
      }
    );
  },

  getByUserId: async (userId) => {
    return await Teacher.findOne({
      where: {
        user_id: userId
      }
    });
  },

  delete: async (id) => {
    return await Teacher.destroy({
      where: { id },
    });
  },
};

module.exports = teacherService;
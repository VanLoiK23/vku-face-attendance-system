const { Where } = require("sequelize/lib/utils");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const Student = require("../models/student");
const { Op } = require("sequelize");
const Teacher = require("../models/teacher");
const saltRounds = 10;

const userService = {
  create: async (data, t) => {
    if (!data.password) {
      //password default 123456 when admin create account
      data.password = "123456";
    }
    const salt = await bcrypt.genSalt(saltRounds);
    data.password = await bcrypt.hash(data.password, salt);

    return await User.create(data, { transaction: t });
  },

  createPasswordResetToken: async (email) => {
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) return null;

      // random token
      const token = crypto.randomBytes(32).toString("hex");

      // save to DB expire after 15 minute
      user.reset_token = token;
      user.reset_token_expiry = Date.now() + 15 * 60 * 1000;
      await user.save();

      return token;
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      const user = await User.findOne({
        where: {
          reset_token: token,
          reset_token_expiry: {
            [Op.gt]: new Date(),
          },
        },
      });

      if (!user) return false;

      const salt = await bcrypt.genSalt(saltRounds);
      const passwordHash = await bcrypt.hash(newPassword, salt);

      user.password = passwordHash;
      user.reset_token = null;
      user.reset_token_expiry = null;

      await user.save();

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  },

  getAll: async () => {
    return await User.findAll({
      attributes: { exclude: ["password"] },
    });
  },

  getById: async (id) => {
    return await User.findByPk(id, {
    //   attributes: {
    //     exclude: ["password"], 
    //   },
      include: [
        { 
          model: Student, 
          as: 'student', 
          attributes: ["studentCode", "name"] 
        }
      ],
    });
  },

  getByEmail: async (email) => {
    return await User.findOne({
      where: { email },
      include: [
        {
          model: Student,
          as: "student",
          attributes: ["id", "studentCode", "name"],
        },
        {
          model: Teacher,
          as: "teacher",
          attributes: ["id", "name"],
        },
      ],
    });
  },

  update: async (id, updateData, t) => {
    //update password
    if (updateData.password) {
      const salt = await bcrypt.genSalt(saltRounds);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    return await User.update(updateData, { where: { id } }, { transaction: t });
  },

  delete: async (id) => {
    return await User.destroy({ where: { id } });
  },
};

module.exports = userService;

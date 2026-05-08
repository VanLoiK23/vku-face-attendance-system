const { sequelize } = require("../../config/database");
const User = require("../../models/user");
const { studentService } = require("../../services/studentService");
const teacherService = require("../../services/teacherService");
const userService = require("../../services/userService");

const getAllUser = async (req, res) => {
  try {
    const users = await userService.getAll();

    return res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Lỗi hệ thống, thử lại sau!" });
  }
};

const getAllStudent = async (req, res) => {
  try {
    const students = await studentService.getDetailInfoAllStudent();
    const studentMaps = [];

    students.forEach((s) => {
      const data = s;
      studentMaps.push({
        ...data,
        student_code: data.studentCode,
        user: { name: data.name },
        id: data.studentId,
      });
    });

    return res.status(200).json(studentMaps);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error System. Please try again later !" });
  }
};

const createNewAccount = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const account = req.body;

    const password = '123456'; //default

    const vkuEmailRegex = /^[a-zA-Z0-9._%+-]+@vku\.udn\.vn$/;

    const email = account.email;
    const role = account.role;

    if (!vkuEmailRegex.test(email)) {
      return res.status(400).json({
        message: "Chỉ cho phép email VKU",
      });
    }

    const exist = await User.findOne({ where: { email }, transaction: t })

    if (exist) {
      return res.status(400).json({
        message: "Email đã tồn tại",
      });
    }

    const newUser = await userService.create({ email, password, role }, t);

    if (role === "student") {
      await studentService.create(
        {
          user_id: newUser.id,
          student_code: account.studentCode,
          name: account.name,
          cohort_id: account.cohortId,
        },
        t
      );
    } else{
      await teacherService.create(
        {
          user_id: newUser.id,
          name: account.name,
        },
        t
      );
    }

    await t.commit();
    return res.status(201).json({ message: "Tạo tài khoản mới thành công!" });
  } catch (error) {
    await t.rollback(); // rollback all if err
    console.error(error);

    console.error("Lỗi add New Account:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        message: `Mã sinh viên "${req.body.studentCode}" đã tồn tại trên hệ thống!`,
      });
    }

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: error.errors[0].message,
      });
    }

    return res.status(500).json({ message: "Lỗi hệ thống!" });
  }
};

const updateAccount = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const account = req.body;
    const { id } = req.params;

    if (account.email !== account.oldEmail) {
      const { email, userId } = account;
      const vkuEmailRegex = /^[a-zA-Z0-9._%+-]+@vku\.udn\.vn$/;

      if (!vkuEmailRegex.test(email)) {
        return res.status(400).json({
          message: "Chỉ cho phép email VKU",
        });
      }

      const exist = await User.findOne({ where: { email }, transaction: t })

      if (exist) {
        return res.status(400).json({
          message: "Email đã tồn tại",
        });
      }

      const updateUser = await userService.update(userId, account, t);
    }

    if (account.role === "student") {
      await studentService.update(id, account, t);
    } else{
      await teacherService.update(id, account, t);
    }

    await t.commit();
    return res.status(201).json({ message: "Cập nhật tài khoản thành công!" });
  } catch (error) {
    await t.rollback(); // rollback all if err
    console.error(error);

    console.error("Lỗi updateAccount:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        message: `Mã sinh viên "${req.body.studentCode}" đã tồn tại trên hệ thống!`,
      });
    }

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: error.errors[0].message,
      });
    }

    return res.status(500).json({ message: "Lỗi hệ thống!" });
  }
};


const deleteAccount = async (req, res) => {
    try {
        const { id } = req.params; 

        const deletedCount = await userService.delete(id);

        if (deletedCount === 0) {
            return res.status(404).json({ message: "Không tìm thấy tài khoản để xóa!" });
        }

        return res.status(200).json({ message: "Xóa tài khoản thành công!" });

    } catch (error) {
        console.error("Lỗi xóa tài khoản:", error);
        return res.status(500).json({ message: "Lỗi hệ thống, thử lại sau!" });
    }
}

const getAllTeacher = async (req, res) => {
  try {
    const teachers = await teacherService.getAll();

    return res.status(200).json(teachers);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error System. Please try again later !" });
  }
};

module.exports = {
  getAllUser,
  getAllStudent,
  getAllTeacher,
  createNewAccount,
  updateAccount,
  deleteAccount
};

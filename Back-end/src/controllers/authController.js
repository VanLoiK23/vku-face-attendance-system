require("dotenv").config();
const userService = require("../services/userService");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generateStudentCode = require("../helper/generateStudentCode");
const studentService = require("../services/studentService");
const teacherService = require("../services/teacherService");
const { sequelize } = require("../config/database");
const transporter = require("../config/emailer");
const User = require("../models/user");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userService.getByEmail(email);

    if (!user) {
      return res
        .status(404)
        .json({ message: "Email không tồn tại trên hệ thống VKU!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Mật khẩu không chính xác!" });
    }

    console.log(user);

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.role === "student" ? user.student?.name : user.teacher?.name,
      accountId: user.role === "student" ? user.student?.id : user.teacher?.id,
      studentId: user.student?.studentCode,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    return res.status(200).json({
      message: "Đăng nhập thành công",
      access_token: accessToken,
      user: payload,
    });
  } catch (err) {
    console.error("Login Error: ", err);
    return res.status(500).json({ message: "Lỗi hệ thống, thử lại sau!" });
  }
};

const register = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { name, email, password, role } = req.body;

    const vkuEmailRegex = /^[a-zA-Z0-9._%+-]+@vku\.udn\.vn$/;

    if (!vkuEmailRegex.test(email)) {
      return res.status(400).json({
        message: "Chỉ cho phép email VKU",
      });
    }

    const exist = await User.findOne({ where: { email } });

    if (exist) {
      return res.status(400).json({
        message: "Email đã tồn tại",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Mật khẩu quá ngắn",
      });
    }

    const newUser = await userService.create({ email, password, role }, t);

    if (role === "student") {
      const studentCode = await generateStudentCode();

      console.log("Student code: "+studentCode)
      await studentService.create(
        {
          user_id: newUser.id,
          studentCode,
          name: name,
        },
        t
      );
    }
    // else if (role === 'teacher') {
    //     await teacherService.create({
    //         user_id: newUser.id,
    //         name: name
    //     }, t);
    // }

    await t.commit();
    return res.status(201).json({ message: "Đăng ký thành công!" });
  } catch (error) {
    await t.rollback(); // rollback all if err
    console.error(error);
    return res.status(500).json({ message: "Lỗi hệ thống!" });
  }
};

const forgot_password = async (req, res) => {
  const { email } = req.body;

  const token = await userService.createPasswordResetToken(email);

  if (!token) {
    return res.status(400).json({ message: "Email không tồn tại" });
  }

  const resetLink = `http://localhost/reset-password/${token}`;

  await transporter.sendMail({
    to: email,
    subject: "Reset Password",
    html: `<a href="${resetLink}">Click để reset mật khẩu</a>`,
  });

  res.json({ message: "Đã gửi link reset. Vui lòng check email" });
};

const reset_password = async (req, res) => {
  const { token, password } = req.body;

  const success = await userService.resetPassword(token, password);

  if (!success) {
    return res
      .status(400)
      .json({ isSuccess: false, message: "Token không hợp lệ hoặc hết hạn" });
  }

  res.json({ isSuccess: true, message: "Đổi mật khẩu thành công" });
};

module.exports = { login, register, forgot_password, reset_password };

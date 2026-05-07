const Student = require("../models/student");
const User = require("../models/user");
const Cohort = require("../models/cohort");
const ClassSection = require("../models/class_section");
const AttendanceRecord = require("../models/AttendanceRecord");

const { sequelize } = require("../config/database");

const studentService = {
  create: async (data, t) => {
    return await Student.create(data, { transaction: t });
  },

  getAll: async () => {
    return await Student.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["email", "role"],
        },
        {
          model: Cohort,
          as: "cohort",
          attributes: ["id", "name"],
        },
      ],
    });
  },

  getDetailInfoAllStudent: async () => {
    const sql = `
      SELECT
        s.id AS "studentId",
        s.name,
        s.student_code AS "studentCode",

        u.email,

        u.id AS user_id,

        co.name AS cohort,

        co.id AS cohort_id,

        cs.name AS "classSection",

        sub.name AS subject,

        s.face_status AS "faceStatus",

        ROUND(
          COALESCE(
            COUNT(ar.id) FILTER (WHERE ar.status = 'present') * 100.0
            / NULLIF(COUNT(ar.id), 0),
            0
          ),
        2) AS "attendanceRate"

      FROM students s

      LEFT JOIN users u
        ON u.id = s.user_id

      LEFT JOIN cohorts co
        ON co.id = s.cohort_id

      LEFT JOIN enrollments e
        ON e.student_id = s.id

      LEFT JOIN class_sections cs
        ON cs.id = e.class_section_id

      LEFT JOIN subjects sub
        ON sub.id = cs.subject_id

      LEFT JOIN attendance_records ar
        ON ar.student_id = s.id

      GROUP BY
        s.id,
        u.id,
        co.id,
        cs.id,
        sub.id

      ORDER BY s.id;
    `;

    try {
      const [result] = await sequelize.query(sql);
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  getByCode: async (code) => {
    return await Student.findOne({
      where: {
        studentCode: code,
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["email"],
        },
        {
          model: Cohort,
          as: "cohort",
          attributes: ["name"],
        },
      ],
    });
  },

  getById: async (id) => {
    return await Student.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["email"],
        },
        {
          model: Cohort,
          as: "cohort",
          attributes: ["name"],
        },
        {
          model: ClassSection,
          as: "classSections",
          through: { attributes: [] },
          attributes: ["id", "name"],
        },
      ],
    });
  },

  update: async (id, updateData) => {
    return await Student.update(updateData, {
      where: { id },
    });
  },

  delete: async (id) => {
    return await Student.destroy({
      where: { id },
    });
  },
};

module.exports = { studentService };
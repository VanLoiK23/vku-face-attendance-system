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

    STRING_AGG(DISTINCT cs.name, ', ') AS "classSection",

    STRING_AGG(DISTINCT sub.name, ', ') AS "subject",
    s.face_status AS "faceStatus",

    ROUND(
        COALESCE(
            COUNT(ar.id) FILTER (WHERE ar.status = 'present') * 100.0 
            / NULLIF(COUNT(ar.id), 0), 
            0
        ), 2
    ) AS "attendanceRate"
FROM students s
LEFT JOIN users u ON u.id = s.user_id
LEFT JOIN cohorts co ON co.id = s.cohort_id
LEFT JOIN enrollments e ON e.student_id = s.id
LEFT JOIN class_sections cs ON cs.id = e.class_section_id
LEFT JOIN subjects sub ON sub.id = cs.subject_id
LEFT JOIN attendance_records ar ON ar.student_id = s.id
GROUP BY 
    s.id, 
    u.id, 
    co.id 
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

  getByUserId: async (userId) => {
    return await Student.findOne({
      where: {
        user_id: userId,
      },
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

  update: async (id, updateData, t) => {
    return await Student.update(updateData, {
      where: { id },
      transaction: t,
    });
  },

  delete: async (id) => {
    return await Student.destroy({
      where: { id },
    });
  },

  getAllPendingStudents: async (page, limit) => {
    const offset = (page - 1) * limit;

    return await Student.findAndCountAll({
      where: { faceStatus: "pending" },
      limit: limit,
      offset: offset,
      order: [["uploaded_at", "DESC"]],
    });// return về rows(ds sinh viên đã phân trang) and count(tổng số sinh viên) 
  },
  getFaceApprovalStats: async () => {
    const pending = await Student.count({ where: { faceStatus: "pending" } });
    const confirm = await Student.count({ where: { faceStatus: "confirm" } });
    const reject = await Student.count({ where: { faceStatus: "reject" } });

    return { pending, confirm, reject };
  },
};

module.exports = studentService;

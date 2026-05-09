const ClassSection = require("../models/class_section");
const Teacher = require("../models/teacher");
const Student = require("../models/student");
const Subject = require("../models/subject");
const Cohort = require("../models/cohort");
const Semester = require("../models/semester");
const Schedule = require("../models/schedule");
const AttendanceSession = require("../models/AttendanceSession");
const AttendanceRecord = require("../models/AttendanceRecord");

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

  getAllByTeacherId: async (teacherId) => {
    return await ClassSection.findAll({
      where: { teacher_id: teacherId },
      include: [
        {
          model: Teacher,
          as: "teacher",
          attributes: ["id", "name"],
        },
        {
          model: Subject,
          as: "subject",
          attributes: ["id", "credits", "name", "code"],
        },
        {
          model: Student,
          as: "students",
          attributes: ["id", "studentCode", "name", "faceStatus"],
          through: { attributes: [] }, //hidden bảng trung gian
        },
        {
          model: Schedule,
          as: "schedules",
          attributes: [
            "id",
            "room",
            "dayOfWeek",
            "startPeriod",
            "endPeriod",
            "weekStart",
            "weekEnd",
          ],
          include: [
            {
              model: AttendanceSession,
              as: "sessions",
              attributes: ["id", "sessionDate"],
              include: [
                {
                  model: AttendanceRecord,
                  as: "records",
                  attributes: [
                    "id",
                    "status",
                    "student_id",
                    "checkinTime",
                    "similarity",
                  ],
                },
              ],
            },
            {
              model: Semester,
              as: "semester",
              attributes: ["id", "name"],
            },
          ],
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
          attributes: ["id", "studentCode", "name", "faceStatus"],

          include: [
            {
              model: Cohort,
              as: "cohort",
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: Schedule,
          as: "schedules",
          attributes: [
            "id",
            "room",
            "dayOfWeek",
            "startPeriod",
            "endPeriod",
            "weekStart",
            "weekEnd",
          ],
          include: [
            {
              model: AttendanceSession,
              as: "sessions",
              attributes: ["id", "sessionDate"],
              include: [
                {
                  model: AttendanceRecord,
                  as: "records",
                  attributes: [
                    "id",
                    "status",
                    "student_id",
                    "checkinTime",
                    "similarity",
                  ],
                },
              ],
            },
            {
              model: Semester,
              as: "semester",
              attributes: ["id", "name"],
            },
          ],
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
          attributes: ["id", "studentCode", "name", "faceStatus"],

          include: [
            {
              model: Cohort,
              as: "cohort",
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: Schedule,
          as: "schedules",
          attributes: [
            "id",
            "room",
            "dayOfWeek",
            "startPeriod",
            "endPeriod",
            "weekStart",
            "weekEnd",
          ],
          include: [
            {
              model: AttendanceSession,
              as: "sessions",
              attributes: ["id", "sessionDate"],
              include: [
                {
                  model: AttendanceRecord,
                  as: "records",
                  attributes: [
                    "id",
                    "status",
                    "student_id",
                    "checkinTime",
                    "similarity",
                  ],
                },
              ],
            },
            {
              model: Semester,
              as: "semester",
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

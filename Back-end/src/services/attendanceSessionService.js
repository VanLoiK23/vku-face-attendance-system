const ClassSection = require("../models/class_section");
const Teacher = require("../models/teacher");
const Student = require("../models/student");
const Subject = require("../models/subject");
const Cohort = require("../models/cohort");
const Semester = require("../models/semester");
const Schedule = require("../models/schedule");
const AttendanceSession = require("../models/AttendanceSession");
const AttendanceRecord = require("../models/AttendanceRecord");
const { Op } = require("sequelize");
const { getById } = require("./scheduleService");

const attendanceSessionService = {
  create: async (data) => {
    return await AttendanceSession.create(data);
  },
  getTodaySessionByScheduleId: async (scheduleId) => {
    const today = new Date().toISOString().split("T")[0];
    return await AttendanceSession.findOne({
      where: {
        schedule_id: scheduleId,
        sessionDate: today,
      },
    });
  },
  getAll: async () => {
    return await AttendanceSession.findAll({
      include: [
        {
          model: Schedule,
          as: "schedule",
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
              model: ClassSection,
              as: "classSection",
              attributes: ["id", "name", "room"],
              include: [
                {
                  model: Subject,
                  as: "subject",
                  attributes: ["id", "credits", "name", "code"],
                },
              ],
            },
          ],
        },
        {
          model: AttendanceRecord,
          as: "records",
          attributes: ["id", "status", "checkinTime", "similarity"],
        },
      ],
    });
  },

  getDetailSession: async (id) => {
    return await AttendanceSession.findByPk(id, {
      include: [
        {
          model: Schedule,
          as: "schedule",
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
              model: ClassSection,
              as: "classSection",
              attributes: ["id", "name", "room"],
              include: [
                {
                  model: Subject,
                  as: "subject",
                  attributes: ["id", "credits", "name", "code"],
                },
              ],
            },
          ],
        },
        {
          model: AttendanceRecord,
          as: "records",
          attributes: ["id", "status", "checkinTime", "similarity"],
          include: [
            {
              model: Student,
              as: "student",
              attributes: ["id", "name", "studentCode"],
            },
          ],
        },
      ],
    });
  },

  getById: async (id) => {
    return await AttendanceSession.findByPk(id);
  },

  update: async (id, data) => {
    return await AttendanceSession.update(data, {
      where: { id },
    });
  },

  delete: async (id) => {
    return await AttendanceSession.destroy({
      where: { id },
    });
  },
};

const getTodaySessionByScheduleId = async (schedule_id) => {
  const today = new Date().toISOString().split("T")[0];

  return await AttendanceSession.findOne({
    where: {
      schedule_id: schedule_id,
      session_date: today,
    },
  });
};

module.exports = { attendanceSessionService, getTodaySessionByScheduleId };

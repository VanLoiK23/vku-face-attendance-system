const Cohort = require("../models/cohort");
const Student = require("../models/student");

const cohortService = {
  create: async (data) => {
    return await Cohort.create(data);
  },

  getAll: async () => {
    return await Cohort.findAll({
      include: [
        {
          model: Student,
          as: "students",
          attributes: ["id", "studentCode", "name", "faceStatus"],
        },
      ],
      order: [['name', 'ASC']] 
    });
  },

  getDetails: async (id) => {
    return await Cohort.findByPk(id, {
      include: [
        {
          model: Student,
          as: "students",
          attributes: ["id", "studentCode", "name", "faceStatus"],
        },
      ],
    });
  },

  update: async (id, data) => {
    return await Cohort.update(data, {
      where: { id },
    });
  },

  delete: async (id) => {
    return await Cohort.destroy({
      where: { id },
    });
  },

  assignStudents: async (cohortId, studentIds) => {
    return await Student.update(
      { cohort_id: cohortId }, 
      {
        where: {
          id: studentIds 
        }
      }
    );
  },

  removeStudentFromCohort: async (studentId) => {

    if (!studentId || studentId === 'undefined') {
      throw new Error("Student ID is required and must be a valid number");
  }

    return await Student.update(
      { cohort_id: null },
      {
        where: { id: studentId }
      }
    );
  }
};

module.exports = cohortService;
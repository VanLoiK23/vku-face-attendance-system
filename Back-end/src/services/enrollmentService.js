const ClassSection = require("../models/class_section");

const enrollmentService = {
  enroll: async ({ student_id, class_section_id }) => {
    const classInstance = await ClassSection.findByPk(class_section_id);
    if (!classInstance) throw new Error("Không tìm thấy lớp học phần");

    // Sử dụng hàm addStudent được Sequelize tự sinh ra
    // tự động INSERT vào bảng 'enrollments'
    return await classInstance.addStudent(student_id);
  },

  remove: async (studentId, classId) => {
    const classInstance = await ClassSection.findByPk(classId);
    if (!classInstance) throw new Error("Không tìm thấy lớp học phần");

    // Sử dụng hàm removeStudent để xóa bản ghi trong bảng trung gian
    return await classInstance.removeStudent(studentId);
  }
};

module.exports = enrollmentService;
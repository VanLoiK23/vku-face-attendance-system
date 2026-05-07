const enrollmentService = require("../../services/enrollmentService");

const enrollmentController = {
    enrollStudent: async (req, res) => {
        try {
            const result = await enrollmentService.enroll(req.body);
            return res.status(201).json({
                success: true,
                message: "Đã thêm sinh viên vào lớp",
                data: result
            });
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({
                    success: false,
                    message: "Sinh viên này đã có tên trong lớp rồi!"
                });
            }
            return res.status(500).json({ message: error.message });
        }
    },

    removeStudent: async (req, res) => {
        try {
            const { student_id, class_section_id } = req.body;

            const deleted = await enrollmentService.remove(student_id, class_section_id);

            if (deleted === 0) {
                return res.status(404).json({ message: "Không tìm thấy bản ghi để xóa" });
            }

            return res.status(200).json({
                success: true,
                message: "Đã xóa sinh viên khỏi lớp học phần"
            });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
};

module.exports = enrollmentController;
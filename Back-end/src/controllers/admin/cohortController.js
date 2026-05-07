const cohortService = require("../../services/cohortService");

const cohortController = {
    getAll: async (req, res) => {
        try {
            const result = await cohortService.getAll();
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    create: async (req, res) => {
        try {
            const result = await cohortService.create(req.body);
            return res.status(201).json(result);
        } catch (error) {
            console.error("Lỗi tạo Cohort:", error);
    
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({ 
                    success: false,
                    message: `Tên khóa học "${req.body.name}" đã tồn tại trên hệ thống!` 
                });
            }
    
            if (error.name === 'SequelizeValidationError') {
                return res.status(400).json({ 
                    success: false,
                    message: error.errors[0].message 
                });
            }
    
            return res.status(500).json({ 
                success: false,
                message: "Có lỗi xảy ra khi tạo khóa học mới" 
            });
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;
            await cohortService.update(id, req.body);
            return res.status(200).json({ message: "Cập nhật thành công" });
        } catch (error) {
            return res.status(400).json({ message: "Lỗi cập nhật thông tin" });
        }
    },

    delete: async (req, res) => {
        try {
            const { id } = req.params;
            await cohortService.delete(id);
            return res.status(200).json({ message: "Đã xóa khóa học" });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi khi xóa" });
        }
    },

    getStudents: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await cohortService.getDetails(id);
            if (!result) return res.status(404).json({ message: "Không tìm thấy khóa" });
            
            return res.status(200).json(result.students);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },


    assignStudents: async (req, res) => {
        try {
            const { cohortId } = req.params;
            const { student_ids } = req.body;

            if (!student_ids || !Array.isArray(student_ids)) {
                return res.status(400).json({ message: "Danh sách sinh viên không hợp lệ" });
            }

            await cohortService.assignStudents(cohortId, student_ids);
            return res.status(200).json({ message: "Đã gán sinh viên vào khóa học thành công" });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi khi gán sinh viên" });
        }
    },

    
    removeStudent: async (req, res) => {
        try {
            const { sid } = req.params; 

            console.log("Student ID nhận được:", sid);

            await cohortService.removeStudentFromCohort(sid);
            return res.status(200).json({ message: "Đã đưa sinh viên ra khỏi khóa học" });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi khi gỡ sinh viên" });
        }
    }
};

module.exports = cohortController;
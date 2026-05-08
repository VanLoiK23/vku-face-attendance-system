const semesterService = require("../../services/semesterService");

const semesterController = {
    getAllSemesters: async (req, res) => {
        try {
            const result = await semesterService.getAll();
            return res.status(200).json(result);
        } catch (error) {
            console.error("Error getAllSemesters:", error);
            return res.status(500).json({ message: "Lỗi khi lấy danh sách học kỳ" });
        }
    },

    getSemesterById: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await semesterService.getById(id);
            if (!result) {
                return res.status(404).json({ message: "Không tìm thấy học kỳ này" });
            }
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ message: "Lỗi hệ thống" });
        }
    },

    createSemester: async (req, res) => {
        try {
            const { name, start_date } = req.body;
            
            if (!name || !start_date) {
                return res.status(400).json({ message: "Tên và ngày bắt đầu không được để trống" });
            }

            const result = await semesterService.create(req.body);
            return res.status(201).json({
                message: "Tạo học kỳ thành công!",
                data: result
            });
        } catch (error) {
            return res.status(400).json({ message: error.message || "Không thể tạo học kỳ" });
        }
    },

    updateSemester: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await semesterService.update(id, req.body);
            
            return res.status(200).json({
                message: "Cập nhật học kỳ thành công!",
                data: result
            });
        } catch (error) {
            return res.status(400).json({ message: error.message || "Cập nhật thất bại" });
        }
    },

    deleteSemester: async (req, res) => {
        try {
            const { id } = req.params;
            await semesterService.delete(id);
            return res.status(200).json({ message: "Đã xóa học kỳ thành công" });
        } catch (error) {
            return res.status(400).json({ 
                message: error.message || "Không thể xóa học kỳ này vì đã có dữ liệu lịch học liên quan" 
            });
        }
    }
};

module.exports = semesterController;
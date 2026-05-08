const scheduleService = require("../../services/scheduleService");

const getAllSchedules = async (req, res) => {
    try {
        const result = await scheduleService.getAll();
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ message: "Lỗi khi lấy danh sách lịch học" });
    }
};

const createSchedule = async (req, res) => {
    try {
        const { start_period, end_period } = req.body;
        if (start_period > end_period) {
            return res.status(400).json({ message: "Tiết bắt đầu không được lớn hơn tiết kết thúc" });
        }

        const result = await scheduleService.create(req.body);
        return res.status(201).json({
            message: "Xếp lịch thành công!",
            data: result
        });
    } catch (error) {
        console.error(error)
        return res.status(400).json({ 
            message: error.message || "Không thể tạo lịch học" 
        });
    }
};

const updateSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await scheduleService.update(id, req.body);
        
        return res.status(200).json({
            message: "Cập nhật lịch thành công!",
            data: result
        });
    } catch (error) {
        return res.status(400).json({ 
            message: error.message || "Cập nhật thất bại" 
        });
    }
};

const deleteSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        await scheduleService.delete(id);
        
        return res.status(200).json({
            message: "Đã xóa lịch học thành công"
        });
    } catch (error) {
        return res.status(404).json({ 
            message: error.message || "Không tìm thấy lịch học để xóa" 
        });
    }
};

module.exports = {getAllSchedules,createSchedule,updateSchedule,deleteSchedule}
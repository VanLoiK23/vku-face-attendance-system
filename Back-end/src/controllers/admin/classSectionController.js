const classSectionService = require("../../services/classSectionService");

const getClassSection = async(req,res)=>{
    try {
        const classSections =await classSectionService.getAll();
        console.log(classSections);

        return res.status(200).json(classSections); 

    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Lỗi hệ thống, thử lại sau!" });
    }
}

const createClassSection = async (req, res) => {
    const data = req.body;

    if (!data || !data.name || !data.subject_id) {
        return res.status(400).json({ 
            success: false, 
            message: "Vui lòng nhập tên lớp và chọn môn học!" 
        });
    }

    try {
        const result = await classSectionService.create(data);
        
        return res.status(200).json({
            success: true,
            message: "Tạo lớp học phần thành công",
            data: result
        });

    } catch (error) {
        console.error("Lỗi Controller ClassSection:", error);

        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({
                success: false,
                message: "Môn học hoặc Giảng viên đã chọn không hợp lệ!"
            });
        }

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: "Tên lớp học phần này đã tồn tại!"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Có lỗi xảy ra khi tạo lớp học phần",
            error: error.message
        });
    }
};

const updateClassSection = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        if (!data || Object.keys(data).length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Không có dữ liệu để cập nhật" 
            });
        }

        const [updatedRows] = await classSectionService.update(id, data);

        if (updatedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Không tìm thấy lớp học phần hoặc dữ liệu không thay đổi" 
            });
        }

        return res.status(200).json({
            success: true,
            message: "Cập nhật lớp học phần thành công"
        });

    } catch (error) {
        console.error("Lỗi Controller Update:", error);

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: "Lớp học phần này đã tồn tại trên hệ thống!"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Có lỗi xảy ra khi cập nhật lớp học phần",
            error: error.message
        });
    }
};

const deleteClassSection = async (req, res) => {
    try {
        const { id } = req.params; 

        const deletedCount = await classSectionService.delete(id);

        if (deletedCount === 0) {
            return res.status(404).json({ message: "Không tìm thấy lớp học phần để xóa!" });
        }

        return res.status(200).json({ message: "Xóa lớp học phần thành công!" });

    } catch (error) {
        console.error("Lỗi xóa lớp học phần:", error);
        return res.status(500).json({ message: "Lỗi hệ thống, thử lại sau!" });
    }
}


module.exports = {getClassSection,createClassSection,updateClassSection,deleteClassSection}
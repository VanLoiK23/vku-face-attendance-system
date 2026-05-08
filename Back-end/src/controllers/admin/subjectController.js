const subjectService = require("../../services/subjectService");

const getSubjects = async(req,res)=>{
    try {
        const subjects =await subjectService.getAll();
        console.log(subjects);

        return res.status(200).json(subjects); 

    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Lỗi hệ thống, thử lại sau!" });
    }
}

const createSubject = async (req, res) => {
    const data = req.body;

    if (data) {
        try {
            const result = await subjectService.create(data);
            
            return res.status(200).json({
                success: true,
                message: "Tạo môn học thành công",
                data: result
            });

        } catch (error) {
            console.error("Lỗi Controller:", error);

            // trùng mã môn
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({
                    success: false,
                    message: "Mã môn học này đã tồn tại!"
                });
            }

            return res.status(500).json({
                success: false,
                message: "Có lỗi xảy ra khi tạo môn học",
                error: error.message
            });
        }
    } else {
        return res.status(400).json({ success: false, message: "Dữ liệu không hợp lệ" });
    }
};


const updateSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        if (!data || Object.keys(data).length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Không có dữ liệu để cập nhật" 
            });
        }

        const [updatedRows] = await subjectService.update(id, data);

        if (updatedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Không tìm thấy môn học hoặc dữ liệu không thay đổi" 
            });
        }

        return res.status(200).json({
            success: true,
            message: "Cập nhật môn học thành công"
        });

    } catch (error) {
        console.error("Lỗi Controller Update:", error);

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: "Mã môn học này đã tồn tại trên hệ thống!"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Có lỗi xảy ra khi cập nhật môn học",
            error: error.message
        });
    }
};

const deleteSubject = async (req, res) => {
    try {
        const { id } = req.params; 

        const deletedCount = await subjectService.delete(id);

        if (deletedCount === 0) {
            return res.status(404).json({ message: "Không tìm thấy môn học để xóa!" });
        }

        return res.status(200).json({ message: "Xóa môn học thành công!" });

    } catch (error) {
        console.error("Lỗi xóa môn học:", error);
        return res.status(500).json({ message: "Lỗi hệ thống, thử lại sau!" });
    }
}

module.exports = {getSubjects,createSubject,updateSubject,deleteSubject}
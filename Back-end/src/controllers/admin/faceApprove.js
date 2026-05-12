const studentService = require("../../services/studentService");
const axios = require("axios");

const getStudentStatusPending = async (req, res) => {
  try {
    // req.query dùng cho get
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const { count, rows } = await studentService.getAllPendingStudents(
      page,
      limit
    );

    const stats = await studentService.getFaceApprovalStats();

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      success: true,
      data: rows,
      meta: {
        totalItems: count,
        totalPages: totalPages,
        page: page,
        limit: limit,
      },
      stats: {
        pending: stats.pending || 0,
        confirm: stats.confirm || 0,
        reject: stats.reject || 0,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi hệ thống, thử lại sau!" });
  }
};

const handleAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { faceStatus, rejectReason } = req.body;

    const student = await studentService.getById(id);

    if (!student) {
      return res.status(404).json({ message: "Không tìm thấy sinh viên!" });
    }

    if (faceStatus === "reject") {
      await studentService.update(id, {
        faceStatus,
        rejectReason,
      });

      return res.status(200).json({
        message: "Đã từ chối video và gửi lý do cho sinh viên",
      });
    }

    await studentService.update(id, {
      faceStatus,
      rejectReason: null,
    });
    
    return res.status(200).json({
      message: "Đã duyệt video. Hệ thống AI đang bắt đầu trích xuất khuôn mặt.",
    });
  } catch (error) {
    console.error("Lỗi Controller Approval:", error);
    return res.status(500).json({ message: "Lỗi hệ thống, thử lại sau!" });
  }
};

module.exports = { getStudentStatusPending, handleAction };

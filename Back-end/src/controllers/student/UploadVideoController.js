// ================================
// controllers/student/UploadVideoController.js
// ================================

const {
  uploadFaceVideoService,
  getFaceVideoService,
} = require("../../services/UploadVideoService");

// GET OLD VIDEO
const getFaceVideo = async (req, res) => {
  try {
    const userId = req.user.id;

    const student = await getFaceVideoService(userId);

    return res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error(error);

    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

// UPLOAD VIDEO
const uploadFaceVideo = async (req, res) => {
  try {
    const userId = req.user?.id;

    const result = await uploadFaceVideoService({
      file: req.file,
      userId,
    });

    return res.status(200).json({
      success: true,
      message: "Upload video thành công. Đang chờ admin duyệt!",
      data: result,
    });
  } catch (error) {
    console.error(error);

    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

module.exports = {
  uploadFaceVideo,
  getFaceVideo,
};

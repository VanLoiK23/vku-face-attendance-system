const dashboardService = require("../../services/DashboardAdminService");

const getDashboard = async (req, res) => {
  try {
    // ✅ CHECK ROLE
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập",
      });
    }

    const data = await dashboardService.getDashboardData();

    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy dữ liệu Dashboard",
    });
  }
};

// ===== GET ALL STUDENTS =====
const getAllStudents = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false });
    }

    const data = await dashboardService.getAllStudentsService();

    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

// ===== GET STUDENT DETAIL =====
const getStudentDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await dashboardService.getStudentDetailService(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sinh viên",
      });
    }

    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

module.exports = {
  getDashboard,
  getAllStudents,
  getStudentDetail,
};

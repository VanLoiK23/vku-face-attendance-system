const teacherService = require("../../services/DashboardTeacherSerive");

const get_Dashboard = async (req, res) => {
  try {
    const teacherId = req.user.accountId;
    if (req.user.role !== "teacher") {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập",
      });
    }
    // hoặc test cứng:
    // const teacherId = 1;

    const data = await teacherService.getTeacherDashboard(teacherId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

module.exports = {
  get_Dashboard,
};

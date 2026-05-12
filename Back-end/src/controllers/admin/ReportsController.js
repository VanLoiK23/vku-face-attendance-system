const reportService = require("../../services/ReportAdminService");

// ===== GET REPORT =====
const getReports = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false });
    }

    const data = await reportService.getReportData();

    return res.json({
      success: true,
      ...data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

// ===== GET FULL DATA EXPORT =====
const getFullReport = async (req, res) => {
  try {
    const { reportType } = req.query;

    let data = [];

    if (reportType === "attendance") {
      data = await reportService.getAttendanceByClass();
    } else if (reportType === "student") {
      data = await reportService.getStudentReportData();
    } else if (reportType === "schedule") {
      data = await reportService.getScheduleReportData();
    } else {
      data = await reportService.getTopAbsentStudents();
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
  getReports,
  getFullReport,
};

const studentAttendanceService = require("../services/studentAttendanceService");

const getMyAttendance = async (req, res) => {
  try {
    const userId = req.user?.id;

    const data = await studentAttendanceService.getMyAttendance(userId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);

    if (error.message === "Student not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { getMyAttendance };
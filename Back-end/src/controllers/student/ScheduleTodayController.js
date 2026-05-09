const todayScheduleService = require("../../services/ScheduleTodayService");

const getTodaySchedule = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    const data = await todayScheduleService.getTodaySchedule(
      userId,
      role
    );

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

module.exports = { getTodaySchedule };
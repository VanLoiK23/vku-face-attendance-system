const scheduleService = require("../../services/WeeklyScheduleService");

const getWeekSchedule = async (req, res) => {
  try {
    const userId = req.user?.id;

    const role = req.user?.role;

    const week = req.query.week ? parseInt(req.query.week) : null;

    const data = await scheduleService.getWeekSchedule(userId, role, week);

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

module.exports = {
  getWeekSchedule,
};

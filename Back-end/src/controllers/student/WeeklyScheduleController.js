const scheduleService = require("../../services/WeeklyScheduleService");

const getWeekSchedule = async (req, res) => {
  try {
      const userId = req.user?.id;

    const data = await scheduleService.getWeekSchedule(userId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { getWeekSchedule };
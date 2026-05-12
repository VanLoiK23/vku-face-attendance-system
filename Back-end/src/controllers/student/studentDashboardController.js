const studentDashboardService = require("../../services/studentDashboardService");

const getDashboard = async (req, res) => {
  try {
    const userId = req.user?.id;

    const rawData = await studentDashboardService.getDashboard(userId);

    const data = rawData.toJSON ? rawData.toJSON() : JSON.parse(JSON.stringify(rawData));

    const nowVN = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
    );
    const currentMinutes = nowVN.getHours() * 60 + nowVN.getMinutes();

    const periodTimes = {
      1: 450,
      2: 510,
      3: 570,
      4: 630,
      5: 690,
      6: 780,
      7: 840,
      8: 900,
      9: 960,
      10: 1020,
    };

    const schedulesWithStatus = data.schedules.map((schedule) => {
      const startMinutes = periodTimes[schedule.startPeriod];
      const endMinutes = periodTimes[schedule.endPeriod] + 60; // Mỗi tiết 50p

      let currentStatus = "completed";

      if (currentMinutes < startMinutes) {
        currentStatus = "upcoming"; // Chưa đến giờ học
      } else if (
        currentMinutes >= startMinutes &&
        currentMinutes <= endMinutes
      ) {
        currentStatus = "ongoing"; // Đang trong giờ học
      } else {
        currentStatus = "completed"; // Đã qua giờ học của hôm nay
      }

      return {
        ...schedule,
        status: currentStatus
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        ...data,
        schedules: schedulesWithStatus,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getDashboard,
};

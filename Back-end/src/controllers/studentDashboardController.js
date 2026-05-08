const studentDashboardService = require('../services/studentDashboardService');

const getDashboard = async (req, res) => {
    try {
        const studentId = req.user?.id;

        const data = await studentDashboardService.getDashboard(studentId);

        return res.status(200).json({
            success: true,
            data
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    getDashboard
};
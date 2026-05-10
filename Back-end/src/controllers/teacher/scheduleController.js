const attendanceService = require("../../services/attendanceService");
const {
  attendanceSessionService,
} = require("../../services/attendanceSessionService");
const scheduleService = require("../../services/scheduleService");

const startAttendanceSession = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const today = new Date().toISOString().split("T")[0];

    const schedule = await scheduleService.getById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: "Không tìm thấy lịch học!" });
    }

    // Tìm hoặc Tạo Session cho NGÀY HÔM NAY
    let attendanceSession = await attendanceSessionService.getTodaySessionByScheduleId(scheduleId);

    if (!attendanceSession) {
      attendanceSession = await attendanceSessionService.create({
        schedule_id: scheduleId,
        sessionDate: today,
      });

      // GHI VẮNG CHO TẤT CẢ SINH VIÊN TRONG LỚP
      const students = schedule.classSection?.students || [];
      if (students.length > 0) {
        const absentRecords = students.map(student => ({
          session_id: attendanceSession.id,
          student_id: student.id,
          status: 'absent', // Mặc định là vắng
          checkinTime: null,
          similarity: null
        }));

        // bulkCreate để insert nhanh hàng loạt
        await attendanceService.bulkCreateRecords(absentRecords);
      }

      console.log(`Đã tạo Session mới cho ngày ${today}`);
    } else {
      console.log(
        `Sử dụng lại Session ID ${attendanceSession.id} của ngày ${today}`
      );
    }

    const rawData = schedule.toJSON();

    const todaySession = rawData.sessions?.[0];

    const alreadyCheckedIn = todaySession?.records?.map(rec => ({
      id: rec.student?.id,
      name: rec.student?.name,
      studentCode: rec.student?.studentCode,
      conf: rec.similarity * 100,
      status: rec.status
    })) || [];

    const formattedData = {
      session: {
        id: rawData.id,
        sessionId: attendanceSession.id,
        sessionDate: attendanceSession.sessionDate || "N/A",
        room: rawData.classSection?.room || "N/A",
        className: rawData.classSection?.name || "Unknown",
        subjectName: rawData.classSection?.subject?.name || "Unknown Subject",
        teacherName: rawData.classSection?.teacher?.name || "N/A",
        alreadyCheckedIn: alreadyCheckedIn
      },
      students: rawData.classSection?.students || [],
      alreadyCheckedIn: alreadyCheckedIn
    };

    return res.status(200).json(formattedData);
  } catch (error) {
    console.error("Lỗi Controller StartSession:", error);
    return res.status(500).json({ message: "Lỗi hệ thống, thử lại sau!" });
  }
};

const checkin = async (req, res) => {
  try {
    const { scheduleId, sessionId, studentId, similarity } = req.body;

    if (!sessionId || !studentId) {
      return res.status(400).json({ message: "Thiếu thông tin Session hoặc Sinh viên!" });
    }

    const session = await attendanceSessionService.getById(sessionId);

    // Nếu quá 15 phút so với giờ bắt đầu thì tính là trễ
    // const startTime = new Date(session.sessionDate);
    const currentTime = new Date();
    
    // const diffMinutes = Math.floor((currentTime - startTime) / 1000 / 60);
    // const status = diffMinutes <= 15 ? "PRESENT" : "LATE";

    const record = await attendanceService.upsertRecord({
      session_id: sessionId,
      student_id: studentId,
      checkinTime: currentTime,
      similarity: similarity,
      status: "present"
    });

    console.log(`✅ Check-in thành công: SV ${studentId} - "present" (${(similarity * 100).toFixed(1)}%)`);

    return res.status(200).json({
      message: "Điểm danh thành công!",
      data: {
        studentId,
        status: "present",
        checkinTime: currentTime,
        similarity
      }
    });

  } catch (error) {
    console.error("Lỗi Controller Checkin:", error);
    return res.status(500).json({ message: "Lỗi hệ thống khi điểm danh!" });
  }
};

module.exports = { startAttendanceSession,checkin };

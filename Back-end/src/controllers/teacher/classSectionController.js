const attendanceSessionService = require("../../services/attendanceSessionService");
const classSectionService = require("../../services/classSectionService");

const calculateTotalSessions = (schedules) => {
  let total = 0;
  schedules.forEach((schedule) => {
    total += schedule.weekEnd - schedule.weekStart + 1;
  });
  return total;
};

const getUniqueRooms = (schedules) => {
  const rooms = schedules.map((s) => s.room).filter(Boolean);
  return [...new Set(rooms)];
};

const getTeacherSections = async (req, res) => {
  try {
    const teacherId = req.user?.accountId;
    const rawSections = await classSectionService.getAllByTeacherId(teacherId);

    const formattedData = rawSections.map((section) => {
      const sectionData = section.toJSON();

      let totalSessionsPlanned = calculateTotalSessions(sectionData.schedules);
      let currentCompletedSessions = 0;
      let totalStudentsInClass = sectionData.students.length;

      let totalPresent = 0;
      let totalRecordsCount = 0;

      let semester;

      // Duyệt qua tất cả lịch học và buổi điểm danh để thống kê
      sectionData.schedules.forEach((schedule) => {
        currentCompletedSessions += schedule.sessions.length;
        semester = schedule.semester;
        schedule.sessions.forEach((session) => {
          const presentCount = session.records.filter(
            (r) => r.status === "present"
          ).length;
          totalPresent += presentCount;
          totalRecordsCount += totalStudentsInClass;
        });
      });

      // Tỷ lệ chuyên cần trung bình (%)
      const avgAttendance =
        totalRecordsCount > 0
          ? Math.round((totalPresent / totalRecordsCount) * 100)
          : 0;

      const uniqueRooms = getUniqueRooms(sectionData.schedules);
      const displayRoom =
        uniqueRooms.length > 1
          ? `${uniqueRooms[0]}, ...`
          : uniqueRooms[0] || "Chưa xếp";

      return {
        id: sectionData.id,
        name: sectionData.name,
        room: displayRoom,
        subject: {
          code: sectionData.subject.code,
          name: sectionData.subject.name,
          credits: sectionData.subject.credits,
        },
        semester: semester,
        studentCount: totalStudentsInClass,
        progress: {
          total: totalSessionsPlanned,
          current: currentCompletedSessions,
        },
        avgAttendance: avgAttendance,
      };
    });

    console.log(formattedData);
    return res.status(200).json(formattedData);
  } catch (error) {
    console.error("Lỗi format data:", error);
    return res.status(500).json({ message: "Lỗi Server" });
  }
};

const getTeacherDetailSection = async (req, res) => {
  try {
    const { classId } = req.params;
    const section = await classSectionService.getDetails(classId);

    if (!section) {
      return res.status(404).json({ message: "Không tìm thấy lớp học phần" });
    }

    const sectionData = section.toJSON();
    const totalStudentsInClass = sectionData.students.length;
    const sessions = [];

    sectionData.schedules.forEach((schedule) => {
      schedule.sessions.forEach((session) => {
        const presentCount = session.records.filter(
          (r) => r.status === "present"
        ).length;

        const today = new Date().setHours(0, 0, 0, 0);
        const sDate = new Date(session.sessionDate).setHours(0, 0, 0, 0);

        let currentStatus = "completed";
        if (sDate > today) currentStatus = "scheduled";
        if (sDate === today) currentStatus = "in-progress";

        sessions.push({
          id: session.id,
          sessionDate: session.sessionDate,
          room: schedule.room,
          period: `${schedule.startPeriod}-${schedule.endPeriod}`,
          present: presentCount,
          total: totalStudentsInClass,
          status: currentStatus,
        });
      });
    });

    sessions.sort((a, b) => new Date(b.sessionDate) - new Date(a.sessionDate));

    return res.status(200).json({
      id: sectionData.id,
      name: sectionData.name,
      subject: sectionData.subject,
      sessions: sessions,
    });
  } catch (error) {
    console.error("Lỗi format data:", error);
    return res.status(500).json({ message: "Lỗi Server" });
  }
};

const getTeacherDetailSessions = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await attendanceSessionService.getDetailSession(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Không tìm thấy dữ liệu" });
    }

    const sessionData = session.toJSON();
    const students = [];

    sessionData.records.forEach((record) => {
      const student = record.student;

      students.push({
        id: student.id,
        name: student.name,
        studentCode: student.studentCode,
        status: record.status,
        checkinTime: record.checkinTime,
        similarity: record.similarity,
      });
    });

    students.sort((a, b) => a.name.localeCompare(b.name, 'vi'));

    return res.status(200).json({
      id: sessionData.id,
      sessionDate: sessionData.sessionDate,
      subject: sessionData.schedule.classSection.subject,
      classSectionName: sessionData.schedule.classSection.name,
      room: sessionData.schedule.room,
      period: `${sessionData.schedule.startPeriod}-${sessionData.schedule.endPeriod}`,
      students
    });
  } catch (error) {
    console.error("Lỗi format data:", error);
    return res.status(500).json({ message: "Lỗi Server" });
  }
};

module.exports = { getTeacherSections, getTeacherDetailSection,getTeacherDetailSessions };

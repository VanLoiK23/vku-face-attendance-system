const Student = require("../models/student");
const AttendanceRecord = require("../models/AttendanceRecord");
const AttendanceSession = require("../models/AttendanceSession");
const Schedule = require("../models/schedule");
const ClassSection = require("../models/class_section");
const Subject = require("../models/subject");

const studentAttendanceService = {
  getMyAttendance: async (userId) => {
    const student = await Student.findOne({
      where: { user_id: userId },
    });

    if (!student) throw new Error("Student not found");

    const records = await AttendanceRecord.findAll({
      where: { student_id: student.id },
      include: [
        {
          model: AttendanceSession,
          as: "session",
          include: [
            {
              model: Schedule,
              as: "schedule",
              include: [
                {
                  model: ClassSection,
                  as: "classSection",
                  include: [
                    {
                      model: Subject,
                      as: "subject",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      order: [["id", "DESC"]], // ✅ FIX
      limit: 50,
    });

    let present = 0,
      absent = 0,
      late = 0;

    const attendanceHistory = records.map((r) => {
  if (r.status === "present") present++;
  else if (r.status === "absent") absent++;
  else if (r.status === "late") late++;

  return {
    id: r.id,
    date: r.session?.sessionDate || r.session?.session_date || "-", // ✅ FIX
    subject: r.session?.schedule?.classSection?.subject?.name || "Unknown",
    time: r.checkin_time || "-",
    status: r.status,
  };
});

    const total = present + absent + late;

    return {
      stats: {
        present,
        absent,
        late,
        attendanceRate: total ? Math.round((present / total) * 100) : 0,
      },
      attendanceHistory,
    };
  },
};

module.exports = studentAttendanceService;
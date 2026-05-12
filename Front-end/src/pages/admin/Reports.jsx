import { useEffect, useState } from "react";
import instance from "../../utils/axios.customize";
import { Avatar, Button, ProgressBar } from "../../helper/helper";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const ReportsPage = () => {
  const [topStudents, setTopStudents] = useState([]);
  const [classStats, setClassStats] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= FETCH =================
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await instance.get("/admin/reports");

        if (res?.data?.success) {
          setTopStudents(res.data.topStudents || []);
          setClassStats(res.data.classStats || []);
        }
      } catch (err) {
        console.error("Fetch report error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // ================= EXPORT EXCEL =================
  const handleExportExcel = async (reportType = "") => {
    try {
      const res = await instance.get("/admin/reports/full", {
        params: { reportType },
      });

      if (!res?.data?.success) return;

      const data = res.data.data || [];

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Report");

      if (reportType === "attendance") {
        sheet.columns = [
          { header: "Lớp", key: "name", width: 20 },
          { header: "Môn học", key: "course", width: 25 },
          { header: "Tỷ lệ (%)", key: "attendanceRate", width: 15 },
        ];
      } else if (reportType === "student") {
        sheet.columns = [
          { header: "MSSV", key: "studentCode", width: 15 },
          { header: "Tên", key: "name", width: 25 },
          { header: "Lớp", key: "class", width: 15 },
          { header: "Chuyên cần (%)", key: "attendanceRate", width: 20 },
        ];
      } else if (reportType === "schedule") {
        sheet.columns = [
          { header: "Lớp", key: "className", width: 15 },
          { header: "Giảng viên", key: "teacherName", width: 25 },
          { header: "Phòng", key: "room", width: 15 },
          { header: "Thứ", key: "dayOfWeek", width: 10 },
          { header: "Tiết bắt đầu", key: "startPeriod", width: 15 },
          { header: "Tiết kết thúc", key: "endPeriod", width: 15 },
        ];
      } else {
        sheet.columns = [
          { header: "Tên", key: "name", width: 25 },
          { header: "MSSV", key: "studentId", width: 15 },
          { header: "Lớp", key: "class", width: 15 },
          { header: "Chuyên cần (%)", key: "attendanceRate", width: 20 },
        ];
      }

      sheet.getRow(1).font = { bold: true };

      data.forEach((item) => sheet.addRow(item));

      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = reportType ? `report_${reportType}.xlsx` : "report.xlsx";

      saveAs(new Blob([buffer]), fileName);
    } catch (err) {
      console.error("Export Excel error:", err);
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div>
      {/* ================= GRID ================= */}
      <div className="grid-2 mb-5">
        {/* TOP STUDENTS */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📊 Top sinh viên nghỉ nhiều</span>
          </div>

          <div style={{ padding: 0 }}>
            {[...(topStudents || [])]
              .slice(0, 5)
              .sort((a, b) => a.attendanceRate - b.attendanceRate)
              .map((s, i) => (
                <div
                  key={s.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 20px",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 50,
                      background: i === 0 ? "var(--danger)" : "var(--bg)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 13,
                      color: i === 0 ? "white" : "var(--text2)",
                    }}
                  >
                    {i + 1}
                  </div>

                  <Avatar initials={s.avatar} size="sm" />

                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>
                      {s.name}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text3)" }}>
                      {s.class} · {s.studentId}
                    </div>
                  </div>

                  <div
                    style={{
                      fontWeight: 700,
                      color: "var(--danger)",
                    }}
                  >
                    {s.attendanceRate}%
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* CLASS STATS */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📈 Tỷ lệ đi học theo lớp</span>
          </div>

          <div className="card-body">
            {(classStats || []).map((c) => (
              <div key={c.id} style={{ marginBottom: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <span style={{ fontWeight: 600 }}>
                    {c.name} - {c.course}
                  </span>

                  <span style={{ fontWeight: 700 }}>{c.attendanceRate}%</span>
                </div>

                <ProgressBar value={c.attendanceRate} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= EXPORT ================= */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">📋 Xuất báo cáo</span>

          <div style={{ display: "flex", gap: 8 }}>
            <Button onClick={() => handleExportExcel()}>📥 Excel tổng</Button>
          </div>
        </div>

        <div className="card-body">
          <div className="grid-3">
            <div
              onClick={() => handleExportExcel("attendance")}
              style={{
                background: "var(--bg)",
                borderRadius: 12,
                padding: 20,
                cursor: "pointer",
              }}
            >
              📊 Báo cáo chuyên cần
            </div>

            <div
              onClick={() => handleExportExcel("student")}
              style={{
                background: "var(--bg)",
                borderRadius: 12,
                padding: 20,
                cursor: "pointer",
              }}
            >
              👤 Báo cáo sinh viên
            </div>

            <div
              onClick={() => handleExportExcel("schedule")}
              style={{
                background: "var(--bg)",
                borderRadius: 12,
                padding: 20,
                cursor: "pointer",
              }}
            >
              📅 Báo cáo lịch học
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;

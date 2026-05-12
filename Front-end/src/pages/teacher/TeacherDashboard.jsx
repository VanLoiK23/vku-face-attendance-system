import { useEffect, useState } from "react";
import instance from "../../utils/axios.customize";
import {
  Button,
  ProgressBar,
  StatCard,
  StatusBadge,
} from "../../helper/helper";
import { useNavigate } from "react-router-dom";
const TeacherDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await instance.get("/teacher/dashboard");

        console.log("Dashboard API:", res.data);

        if (res.data.success) {
          setDashboardData(res.data.data);
        }
      } catch (error) {
        console.error("Lỗi dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!dashboardData) {
    return <div>Không có dữ liệu</div>;
  }

  return (
    <div>
      {/* Stats */}
      <div
        className="stats-grid"
        style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
      >
        <StatCard
          icon="📅"
          label="Buổi dạy hôm nay"
          value={dashboardData?.stats?.todaySessions || 0}
          color="#3b82f6"
        />

        <StatCard
          icon="🎓"
          label="Tổng sinh viên phụ trách"
          value={dashboardData?.stats?.totalStudents || 0}
          color="#10b981"
        />

        <StatCard
          icon="📊"
          label="Chuyên cần TB"
          value={`${dashboardData?.stats?.attendanceAvg || 0}%`}
          color="#f59e0b"
        />
      </div>

      <div className="grid-2">
        {/* ================= LỊCH HÔM NAY ================= */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📋 Lịch dạy hôm nay</span>
          </div>

          <div style={{ padding: 0 }}>
            {dashboardData?.schedulesToday?.length > 0 ? (
              dashboardData.schedulesToday.map((s) => (
                <div
                  key={s.id}
                  style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 15,
                        }}
                      >
                        {s.subject}
                      </div>

                      <div
                        style={{
                          fontSize: 13,
                          color: "var(--text2)",
                          marginTop: 4,
                        }}
                      >
                        🏫 {s.class} · 🚪 {s.room} · ⏰ {s.period}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                      }}
                    >
                      <StatusBadge status={s.status || "upcoming"} />

                      {(s.status || "upcoming") === "upcoming" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            navigate(`/teacher/attendance/cnn/${s.id}`)
                          }
                        >
                          📷 Điểm danh ngay
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: 20 }}>Hôm nay không có lịch dạy</div>
            )}
          </div>
        </div>

        {/* ================= CHUYÊN CẦN THEO LỚP ================= */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📊 Chuyên cần theo lớp</span>
          </div>

          <div className="card-body">
            {dashboardData?.classes?.length > 0 ? (
              dashboardData.classes.map((c) => (
                <div key={c.id} style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 700 }}>{c.name}</span>

                      <span
                        style={{
                          fontSize: 12.5,
                          color: "var(--text2)",
                        }}
                      >
                        {" "}
                        - {c.course}
                      </span>
                    </div>

                    {/* FIX: dùng attendanceRate từ backend */}
                    <span
                      style={{
                        fontWeight: 700,
                        color: "var(--primary)",
                      }}
                    >
                      {c.attendanceRate || 0}%
                    </span>
                  </div>

                  {/* FIX: progress bar theo từng lớp */}
                  <ProgressBar value={Number(c.attendanceRate) || 0} />
                </div>
              ))
            ) : (
              <div>Chưa có lớp nào</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;

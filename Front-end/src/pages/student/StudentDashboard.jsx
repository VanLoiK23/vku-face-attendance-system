import { useEffect, useState } from "react";
import instance from "../../utils/axios.customize";
import { Avatar, StatCard, StatusBadge } from "../../helper/helper";
import { toast } from "react-toastify";

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const res = await instance.get("/dashboard"); 
      setData(res.data?.data);
    } catch (err) {
      toast.error("Lỗi tải dashboard");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading || !data) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  const { student, stats, schedules, recentAttendance } = data;

  const today = new Date().toLocaleDateString("vi-VN");

  return (
    <div>

      {/* HEADER */}
      <div style={{
        background: "linear-gradient(135deg, #4f46e5, #06b6d4)",
        borderRadius: 16,
        padding: 28,
        marginBottom: 24,
        color: "white",
        display: "flex",
        alignItems: "center",
        gap: 24
      }}>
        <Avatar initials={student?.name?.slice(0,2)?.toUpperCase()} size="xl" />

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 800 }}>
            Xin chào, {student?.name} 👋
          </div>
          <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>
            {student?.studentCode} · {student?.cohort?.name || ""} · Hôm nay {today}
          </div>
        </div>

        <div style={{
          textAlign: "center",
          background: "rgba(255,255,255,0.15)",
          padding: "18px 26px",
          borderRadius: 12
        }}>
          <div style={{ fontSize: 38, fontWeight: 900 }}>
            {stats?.attendanceRate || 0}%
          </div>
          <div style={{ fontSize: 13, opacity: 0.8 }}>Chuyên cần</div>
        </div>
      </div>

      {/* STATS */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <StatCard icon="📅" label="Hôm nay" value={stats?.todaySchedules || 0} color="#3b82f6" />
        <StatCard icon="✅" label="Có mặt" value={stats?.totalPresent || 0} color="#10b981" />
        <StatCard icon="❌" label="Vắng" value={stats?.totalAbsent || 0} color="#ef4444" />
      </div>

      {/* MAIN GRID */}
      <div className="grid-2">

        {/* SCHEDULE */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📋 Lịch học hôm nay</span>
          </div>

          {schedules?.length === 0 && (
            <div style={{ padding: 16, color: "#666" }}>Không có lịch hôm nay</div>
          )}

          {schedules?.map((s) => (
            <div
              key={s.id}
              style={{
                padding: "14px 20px",
                borderTop: "1px solid #eee",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>
                  {s.classSection?.name}
                </div>
                <div style={{ fontSize: 12, color: "#888" }}>
                  Tiết {s.startPeriod}-{s.endPeriod} · Phòng {s.room}
                </div>
              </div>

              <StatusBadge status="upcoming" />
            </div>
          ))}
        </div>

        {/* ATTENDANCE */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📊 Điểm danh gần đây</span>
          </div>

          {recentAttendance?.map((a) => (
            <div
              key={a.id}
              style={{
                padding: "12px 20px",
                borderTop: "1px solid #eee",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>
                  {a.session?.schedule?.classSection?.name || "Unknown"}
                </div>
                <div style={{ fontSize: 12, color: "#888" }}>
                  {a.session?.sessionDate}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#666" }}>
                  {a.checkinTime}
                </span>
                <StatusBadge status={a.status} />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
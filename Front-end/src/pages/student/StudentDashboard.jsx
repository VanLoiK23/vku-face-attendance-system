import { useEffect, useState } from "react";
import instance from "../../utils/axios.customize";
import { Avatar, StatCard, StatusBadge } from "../../helper/helper";
import { toast } from "react-toastify";

const StudentDashboard = () => {
  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  // ==========================================
  // FETCH DASHBOARD
  // ==========================================
  const fetchDashboard = async () => {
    try {
      setLoading(true);

      setError(null);

      const res = await instance.get("/dashboard");

      console.log("DASHBOARD:", res.data);

      setData(res.data?.data || null);
    } catch (err) {
      console.log(err);

      setError("Không thể tải dashboard");

      toast.error("Lỗi tải dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div
        style={{
          padding: 30,
          textAlign: "center",
          fontSize: 16,
          fontWeight: 600,
        }}
      >
        Đang tải dashboard...
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================
  if (error) {
    return (
      <div
        style={{
          padding: 20,
          color: "#ef4444",
          fontWeight: 600,
        }}
      >
        {error}
      </div>
    );
  }

  // ==========================================
  // EMPTY
  // ==========================================
  if (!data) {
    return (
      <div
        style={{
          padding: 20,
        }}
      >
        Không có dữ liệu
      </div>
    );
  }

  const {
    student = {},
    stats = {},
    schedules = [],
    recentAttendance = [],
  } = data;

  const today = new Date().toLocaleDateString("vi-VN");

  // ==========================================
  // FORMAT STATUS
  // ==========================================
  const getAttendanceText = (status) => {
    switch (status) {
      case "present":
        return "Có mặt";

      case "absent":
        return "Vắng";

      default:
        return "Không xác định";
    }
  };

  // ==========================================
  // UI
  // ==========================================
  return (
    <div
      style={{
        padding: 24,
      }}
    >
      {/* ========================================== */}
      {/* HEADER */}
      {/* ========================================== */}
      <div
        style={{
          background: "linear-gradient(135deg, #4f46e5, #06b6d4)",
          borderRadius: 20,
          padding: 28,
          marginBottom: 24,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 24,
          boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
          flexWrap: "wrap",
        }}
      >
        <Avatar
          initials={(student?.name || "ST").slice(0, 2).toUpperCase()}
          size="xl"
        />

        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              marginBottom: 6,
            }}
          >
            Xin chào, {student?.name || "Sinh viên"} 👋
          </div>

          <div
            style={{
              fontSize: 14,
              opacity: 0.9,
              lineHeight: 1.7,
            }}
          >
            <div>
              MSSV: <b>{student?.studentCode || "--"}</b>
            </div>

            <div>
              Khóa: <b>{student?.cohort?.name || "--"}</b>
            </div>

            <div>Hôm nay: {today}</div>

            <div>
              Email: <b>{student?.user?.email || "--"}</b>
            </div>
          </div>
        </div>

        {/* ATTENDANCE RATE */}
        <div
          style={{
            background: "rgba(255,255,255,0.15)",
            borderRadius: 16,
            padding: "18px 30px",
            textAlign: "center",
            minWidth: 160,
          }}
        >
          <div
            style={{
              fontSize: 42,
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            {stats?.attendanceRate || 0}%
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 13,
              opacity: 0.9,
            }}
          >
            Tỷ lệ chuyên cần
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* STATS */}
      {/* ========================================== */}
      <div
        className="stats-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
          marginBottom: 24,
        }}
      >
        <StatCard
          icon="📚"
          label="Lịch học hôm nay"
          value={stats?.todaySchedules || 0}
          color="#3b82f6"
        />

        <StatCard
          icon="✅"
          label="Có mặt"
          value={stats?.totalPresent || 0}
          color="#10b981"
        />

        <StatCard
          icon="❌"
          label="Vắng"
          value={stats?.totalAbsent || 0}
          color="#ef4444"
        />
      </div>

      {/* ========================================== */}
      {/* MAIN CONTENT */}
      {/* ========================================== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
        }}
      >
        {/* ========================================== */}
        {/* TODAY SCHEDULE */}
        {/* ========================================== */}
        <div
          style={{
            background: "#fff",
            borderRadius: 18,
            overflow: "hidden",
            border: "1px solid #eee",
            boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
          }}
        >
          {/* HEADER */}
          <div
            style={{
              padding: "18px 22px",
              borderBottom: "1px solid #eee",
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            📋 Lịch học hôm nay
          </div>

          {/* EMPTY */}
          {schedules.length === 0 && (
            <div
              style={{
                padding: 20,
                color: "#666",
              }}
            >
              Không có lịch học hôm nay
            </div>
          )}

          {/* LIST */}
          {schedules.map((s) => (
            <div
              key={s.id}
              style={{
                padding: "18px 22px",
                borderBottom: "1px solid #f3f4f6",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 20,
              }}
            >
              <div>
                {/* SUBJECT */}
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    marginBottom: 6,
                  }}
                >
                  {s?.classSection?.subject?.name ||
                    s?.classSection?.name ||
                    "Unknown"}
                </div>

                {/* INFO */}
                <div
                  style={{
                    fontSize: 13,
                    color: "#6b7280",
                    lineHeight: 1.6,
                  }}
                >
                  <div>
                    Tiết: {s.startPeriod} - {s.endPeriod}
                  </div>

                  <div>Phòng: {s.room || "--"}</div>

                  <div>Lớp: {s?.classSection?.name || "--"}</div>
                </div>
              </div>

              <StatusBadge status="upcoming" />
            </div>
          ))}
        </div>

        {/* ========================================== */}
        {/* ATTENDANCE */}
        {/* ========================================== */}
        <div
          style={{
            background: "#fff",
            borderRadius: 18,
            overflow: "hidden",
            border: "1px solid #eee",
            boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
          }}
        >
          {/* HEADER */}
          <div
            style={{
              padding: "18px 22px",
              borderBottom: "1px solid #eee",
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            📊 Điểm danh gần đây
          </div>

          {/* EMPTY */}
          {recentAttendance.length === 0 && (
            <div
              style={{
                padding: 20,
                color: "#666",
              }}
            >
              Chưa có dữ liệu điểm danh
            </div>
          )}

          {/* LIST */}
          {recentAttendance.map((a) => (
            <div
              key={a.id}
              style={{
                padding: "16px 22px",
                borderBottom: "1px solid #f3f4f6",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 20,
              }}
            >
              <div>
                {/* SUBJECT */}
                <div
                  style={{
                    fontWeight: 700,
                    marginBottom: 5,
                  }}
                >
                  {a?.session?.schedule?.classSection?.subject?.name ||
                    a?.session?.schedule?.classSection?.name ||
                    "Unknown"}
                </div>

                {/* DATE */}
                <div
                  style={{
                    fontSize: 13,
                    color: "#6b7280",
                    lineHeight: 1.6,
                  }}
                >
                  <div>
                    Ngày:{" "}
                    {a?.session?.sessionDate
                      ? new Date(a.session.sessionDate).toLocaleDateString(
                          "vi-VN",
                        )
                      : "--"}
                  </div>

                  <div>
                    Checkin:{" "}
                    {a?.checkinTime
                      ? new Date(a.checkinTime).toLocaleTimeString("vi-VN")
                      : "--"}
                  </div>

                  <div>Trạng thái: {getAttendanceText(a.status)}</div>
                </div>
              </div>

              <StatusBadge status={a.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import instance from "../utils/axios.customize";
import { Button, StatusBadge } from "../helper/helper";
import { toast } from "react-toastify";

const TodaySchedule = ({ role = "student" }) => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTodaySchedule = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await instance.get("/schedule/today");
      const data = res.data?.data || [];
      setSchedules(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch schedule error:", err);
      setError("Không thể tải lịch học");
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodaySchedule();
  }, []);

  // TÌM MÔN BỊ TRÙNG LỊCH (Chỉ dành cho Student)
  const conflictingSchedules = useMemo(() => {
    if (role !== "student" || schedules.length < 2) return [];

    const conflicts = new Set();
    for (let i = 0; i < schedules.length; i++) {
      for (let j = i + 1; j < schedules.length; j++) {
        const s1 = schedules[i];
        const s2 = schedules[j];

        // Kiểm tra giao thoa tiết học: (Bắt đầu A <= Kết thúc B) AND (Bắt đầu B <= Kết thúc A)
        const isOverlap =
          s1.startPeriod <= s2.endPeriod && s2.startPeriod <= s1.endPeriod;

        if (isOverlap) {
          conflicts.add(s1);
          conflicts.add(s2);
        }
      }
    }
    return Array.from(conflicts);
  }, [schedules, role]);

  if (loading) return <div style={{ padding: 20 }}>Đang tải lịch học...</div>;
  if (error) return <div style={{ padding: 20, color: "red" }}>{error}</div>;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* HEADER */}
      <div
        style={{
          background:
            "linear-gradient(135deg, var(--primary-dark), var(--primary-light))",
          borderRadius: "var(--radius)",
          padding: "20px 24px",
          marginBottom: 20,
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: 14, opacity: 0.75 }}>Hôm nay</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>
            {new Date().toLocaleDateString("vi-VN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            {schedules.length}
          </div>
          <div style={{ fontSize: 13, opacity: 0.75 }}>buổi học</div>
        </div>
      </div>

      {/* BOX BÁO TRÙNG LỊCH */}
      {role === "student" && conflictingSchedules.length > 0 && (
        <div
          className="card"
          style={{
            marginBottom: 20,
            border: "1px solid #fee2e2",
            background: "#fff5f5",
            padding: "16px 20px",
          }}
        >
          <h3
            style={{
              fontSize: 16,
              color: "#b91c1c",
              margin: "0 0 12px 0",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            🆘 Môn học bị trùng lịch
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {conflictingSchedules.map((s, idx) => (
              <div key={idx} style={{ fontSize: 13, color: "#7f1d1d" }}>
                • <b>{s.subject}</b> - tiết {s.time} - Phòng {s.room}
              </div>
            ))}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#991b1b",
              marginTop: 10,
              fontStyle: "italic",
            }}
          >
            * Lưu ý: Bạn chỉ có thể được điểm danh AI tại một trong các phòng
            học trên.
          </div>
        </div>
      )}

      {/* DANH SÁCH LỊCH HỌC CHÍNH */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {schedules.length > 0 ? (
          schedules.map((s) => (
            <div
              key={s.id}
              className="card"
              style={{
                borderLeft: `4px solid ${
                  s.status === "ongoing"
                    ? "var(--success)"
                    : s.status === "done"
                    ? "var(--text3)"
                    : "var(--primary)"
                }`,
                opacity: s.status === "done" ? 0.7 : 1,
                position: "relative",
              }}
            >
              {/* Badge Cảnh báo trùng ngay trên item */}
              {role === "student" &&
                conflictingSchedules.some((c) => c.id === s.id) && (
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      fontSize: 10,
                      background: "#fecaca",
                      color: "#b91c1c",
                      padding: "2px 6px",
                      borderRadius: 4,
                      fontWeight: 700,
                    }}
                  >
                    ⚠️ TRÙNG LỊCH
                  </div>
                )}

              <div
                style={{
                  padding: "18px 22px",
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                }}
              >
                <div style={{ textAlign: "center", minWidth: 60 }}>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text3)",
                      fontWeight: 600,
                    }}
                  >
                    TIẾT
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: "var(--primary)",
                    }}
                  >
                    {s.time}
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>
                    {s.subject}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--text2)",
                      marginTop: 4,
                    }}
                  >
                    🏫 Lớp: {s.class || "--"} · 🚪 Phòng: {s.room || "--"}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <StatusBadge status={s.status} />
                  {/* {role === "teacher" && s.status === "ongoing" && (
                    <Button 
                      size="sm" 
                      onClick={() => navigate(`/teacher/attendance/cnn/${s.id}`)}
                    >
                      📷 Điểm danh ngay
                    </Button>
                  )} */}

                  {role === "teacher" && (
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
          <div
            className="card"
            style={{ padding: 30, textAlign: "center", color: "var(--text3)" }}
          >
            🎉 Hôm nay bạn không có lịch dạy/học.
          </div>
        )}
      </div>
    </div>
  );
};

export default TodaySchedule;

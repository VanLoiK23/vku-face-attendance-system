import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import instance from "../utils/axios.customize";
import { Button, StatusBadge } from "../helper/helper";

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

  if (loading) return <div style={{ padding: 20 }}>Đang tải lịch học...</div>;
  if (error) return <div style={{ padding: 20, color: "red" }}>{error}</div>;

  return (
    <div>
      <div style={{
        background: "linear-gradient(135deg, var(--primary-dark), var(--primary-light))",
        borderRadius: "var(--radius)",
        padding: "20px 24px",
        marginBottom: 20,
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div>
          <div style={{ fontSize: 14, opacity: 0.75 }}>Hôm nay</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>
            {new Date().toLocaleDateString("vi-VN", {
              weekday: "long", year: "numeric", month: "long", day: "numeric",
            })}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{schedules.length}</div>
          <div style={{ fontSize: 13, opacity: 0.75 }}>buổi học</div>
        </div>
      </div>

      {/* LIST */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {schedules.length > 0 ? (
          schedules.map((s) => (
            <div key={s.id} className="card" style={{
              borderLeft: `4px solid ${
                s.status === "ongoing" ? "var(--success)" : 
                s.status === "done" ? "var(--text3)" : "var(--primary)"
              }`,
              opacity: s.status === "done" ? 0.7 : 1
            }}>
              <div style={{ padding: "18px 22px", display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ textAlign: "center", minWidth: 60 }}>
                  <div style={{ fontSize: 11, color: "var(--text3)", fontWeight: 600 }}>TIẾT</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "var(--primary)" }}>{s.time}</div>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{s.subject || "Unknown Subject"}</div>
                  <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 4 }}>
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
                      onClick={() => navigate(`/teacher/attendance/cnn/${s.id}`)}
                    >
                      📷 Điểm danh ngay
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card" style={{ padding: 30, textAlign: "center", color: "var(--text3)" }}>
            🎉 Hôm nay bạn không có lịch dạy/học.
          </div>
        )}
      </div>
    </div>
  );
};

export default TodaySchedule;
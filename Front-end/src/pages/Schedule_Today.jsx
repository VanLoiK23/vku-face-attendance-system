import { useState, useEffect } from "react";
import instance from "./../utils/axios.customize";
import { Button, StatusBadge } from "../helper/helper";

const TodaySchedule = ({ role }) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTodaySchedule = async () => {
    try {
      setLoading(true);
      const res = await instance.get("/schedule/today");

      setSchedules(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodaySchedule();
  }, []);

  return (
    <div>
      <div
        style={{
          background: "linear-gradient(135deg, var(--primary-dark), var(--primary-light))",
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
            {new Date().toLocaleDateString("vi-VN")}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            {schedules.length}
          </div>
          <div style={{ fontSize: 13, opacity: 0.75 }}>buổi học</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {schedules.map((s) => (
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
            }}
          >
            <div
              style={{
                padding: "18px 22px",
                display: "flex",
                alignItems: "center",
                gap: 20,
              }}
            >
              <div style={{ textAlign: "center", minWidth: 60 }}>
                <div style={{ fontSize: 11, color: "var(--text3)", fontWeight: 600 }}>
                  TIẾT
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--primary)" }}>
                  {s.period.replace("Tiết ", "")}
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{s.subject}</div>
                <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 4 }}>
                  🏫 {s.class} · 🚪 {s.room} · ⏰ {s.time}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <StatusBadge status={s.status} />

                {role === "teacher" && s.status !== "done" && (
                  <Button size="sm">📷 Bắt đầu điểm danh</Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodaySchedule;
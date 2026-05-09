import { useState, useEffect } from "react";
import instance from "./../utils/axios.customize";

const WeekSchedule = () => {
  const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  
  // Định nghĩa các "Ca" học thay vì tiết cứng nhắc
  const timeSlots = [
    { label: "Sáng (Tiết 1-6)", startRange: 1, endRange: 6 },
    { label: "Chiều (Tiết 7-12)", startRange: 7, endRange: 12 },
  ];

  const [weekData, setWeekData] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchWeekSchedule = async () => {
    try {
      setLoading(true);
      const res = await instance.get("/schedule/week");
      // Fix bóc tách data từ Axios
      const result = res.data?.data || res.data || {};
      setWeekData(result);
    } catch (err) {
      console.error("Lỗi fetch lịch tuần:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeekSchedule();
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Đang tải lịch tuần...</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <select className="form-input form-select" style={{ width: 220 }}>
          <option>Tuần hiện tại</option>
        </select>
        <button className="btn" onClick={fetchWeekSchedule}>Làm mới</button>
      </div>

      <div className="card" style={{ overflowX: "auto" }}>
        <div className="week-grid" style={{ minWidth: "800px" }}>
          {/* Header */}
          <div className="week-header">Thời gian</div>
          {days.map((d) => (
            <div key={d} className="week-header">{d === "CN" ? "Chủ Nhật" : d}</div>
          ))}

          {/* Rows theo Ca học */}
          {timeSlots.map((slot, si) => (
            <div key={si} style={{ display: "contents" }}>
              <div className="week-period-label" style={{ backgroundColor: "#f8fafc", fontWeight: 600 }}>
                {slot.label}
              </div>

              {days.map((d) => {
                // ✅ FIX: Tìm các bài học có startPeriod nằm trong khung của Slot này
                const lessons = (weekData[d] || []).filter(
                  (l) => l.startPeriod >= slot.startRange && l.startPeriod <= slot.endRange
                );

                return (
                  <div key={`${d}-${si}`} className="week-cell">
                    {lessons.length > 0 ? (
                      lessons.map((l, i) => (
                        <div key={i} className="week-lesson" style={{ 
                          backgroundColor: "#e0f2fe", 
                          borderLeft: "4px solid #0ea5e9",
                          marginBottom: "4px" 
                        }}>
                          <div style={{ fontWeight: 700, fontSize: 12, color: "#0369a1" }}>
                            {l.subject}
                          </div>
                          <div style={{ fontSize: 11, color: "#0c4a6e" }}>
                            ⏰ {l.time}
                          </div>
                          <div style={{ fontSize: 10, opacity: 0.8, fontWeight: 600 }}>
                            🚪 Phòng: {l.room}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ color: "#cbd5e1", fontSize: 10, textAlign: "center" }}>-</div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeekSchedule;
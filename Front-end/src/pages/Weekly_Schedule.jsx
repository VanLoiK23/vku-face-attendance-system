import { useState, useEffect } from "react";
import instance from "./../utils/axios.customize";
const WeekSchedule = () => {
  const days = ["T2", "T3", "T4", "T5", "T6", "T7"];
  const periods = [
    { id: "1-3", label: "Tiết 1-3\n07:00-09:30" },
    { id: "4-6", label: "Tiết 4-6\n09:45-12:15" },
    { id: "7-9", label: "Tiết 7-9\n13:00-15:30" },
  ];

  const [weekData, setWeekData] = useState({
    T2: [],
    T3: [],
    T4: [],
    T5: [],
    T6: [],
    T7: [],
  });

  const fetchWeekSchedule = async () => {
    try {
      const res = await instance.get("/schedule/week");
      setWeekData(res.data?.data || {});
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWeekSchedule();
  }, []);

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <select className="form-input form-select" style={{ width: 220 }}>
          <option>Tuần hiện tại</option>
        </select>
      </div>

      <div className="card">
        <div className="week-grid">
          <div className="week-header">Tiết</div>

          {days.map((d) => (
            <div key={d} className="week-header">
              {d}
            </div>
          ))}

          {periods.map((p, pi) => (
            <div key={pi} style={{ display: "contents" }}>
              <div className="week-period-label">
                {p.label.split("\n").map((l, i) => (
                  <div key={i}>{l}</div>
                ))}
              </div>

              {days.map((d) => {
                const lessons = (weekData[d] || []).filter(
                  (l) => l.period === p.id
                );

                return (
                  <div key={`${d}-${pi}`} className="week-cell">
                    {lessons.map((l, i) => (
                      <div key={i} className="week-lesson">
                        <div style={{ fontWeight: 700, fontSize: 12 }}>
                          {l.subject}
                        </div>
                        <div style={{ fontSize: 10.5, opacity: 0.85 }}>
                          {l.class}
                        </div>
                        <div style={{ fontSize: 10.5, opacity: 0.85 }}>
                          🚪 {l.room}
                        </div>
                      </div>
                    ))}
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
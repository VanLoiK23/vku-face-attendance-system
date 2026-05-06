import { useState, useEffect, useRef } from "react";

const WeekSchedule = () => {
  const days = ["T2", "T3", "T4", "T5", "T6", "T7"];
  const periods = [{ id: "1-3", label: "Tiết 1-3\n07:00-09:30" }, { id: "4-6", label: "Tiết 4-6\n09:45-12:15" }, { id: "7-9", label: "Tiết 7-9\n13:00-15:30" }];
  
  const mockWeekSchedule = {
    "T2": [
      { period: "1-3", subject: "Lập trình Web", class: "21SE1", room: "P201" },
      { period: "4-6", subject: "Lập trình Python", class: "22IT1", room: "P202" },
    ],
    "T3": [
      { period: "4-6", subject: "Cơ sở dữ liệu", class: "21SE2", room: "P301" },
    ],
    "T4": [
      { period: "1-3", subject: "Lập trình Web", class: "21SE1", room: "P201" },
    ],
    "T5": [
      { period: "4-6", subject: "Cơ sở dữ liệu", class: "21SE2", room: "P301" },
    ],
    "T6": [
      { period: "4-6", subject: "Lập trình Python", class: "22IT1", room: "P202" },
    ],
    "T7": [],
  };
  
  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <select className="form-input form-select" style={{ width: 220 }}><option>Tuần 18 (01/05 - 07/05)</option><option>Tuần 19</option><option>Tuần 17</option></select>
      </div>
      <div className="card">
        <div className="week-grid">
          <div className="week-header">Tiết</div>
          {days.map(d => <div key={d} className="week-header" style={{ background: d === "T3" ? "var(--accent)" : undefined }}>{d}</div>)}
          {periods.map((p, pi) => (
            <>
              <div key={`p-${pi}`} className="week-period-label">{p.label.split("\n").map((l, i) => <div key={i}>{l}</div>)}</div>
              {days.map((d) => {
                const lessons = (mockWeekSchedule[d] || []).filter(l => l.period === p.id);
                return (
                  <div key={`${d}-${pi}`} className="week-cell">
                    {lessons.map((l, i) => (
                      <div key={i} className={`week-lesson ${d === "T3" ? "accent" : ""}`}>
                        <div style={{ fontWeight: 700, fontSize: 12 }}>{l.subject}</div>
                        <div style={{ fontSize: 10.5, opacity: 0.85 }}>{l.class}</div>
                        <div style={{ fontSize: 10.5, opacity: 0.85 }}>🚪 {l.room}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  );
};

  export default WeekSchedule;
  
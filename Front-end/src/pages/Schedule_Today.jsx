import { useState, useEffect, useRef } from "react";
import {Button,StatusBadge} from '../helper/helper'

const mockScheduleToday = [
  { id: 1, time: "07:00 - 09:30", subject: "Lập trình Web", class: "21SE1", room: "P201", period: "Tiết 1-3", status: "upcoming" },
  { id: 2, time: "09:45 - 12:15", subject: "Lập trình Python", class: "22IT1", room: "P202", period: "Tiết 4-6", status: "ongoing" },
  { id: 3, time: "13:00 - 15:30", subject: "Lập trình Web", class: "21SE2", room: "P301", period: "Tiết 7-9", status: "done" },
];

const TodaySchedule = ({ role }) => (
    <div>
      <div style={{ background: "linear-gradient(135deg, var(--primary-dark), var(--primary-light))", borderRadius: "var(--radius)", padding: "20px 24px", marginBottom: 20, color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 14, opacity: 0.75 }}>Hôm nay, Thứ Ba</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>05/05/2026</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{mockScheduleToday.length}</div>
          <div style={{ fontSize: 13, opacity: 0.75 }}>buổi học</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {mockScheduleToday.map(s => (
          <div key={s.id} className="card" style={{ borderLeft: `4px solid ${s.status === "ongoing" ? "var(--success)" : s.status === "done" ? "var(--text3)" : "var(--primary)"}` }}>
            <div style={{ padding: "18px 22px", display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ textAlign: "center", minWidth: 60 }}>
                <div style={{ fontSize: 11, color: "var(--text3)", fontWeight: 600 }}>TIẾT</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--primary)" }}>{s.period.replace("Tiết ", "")}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{s.subject}</div>
                <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 4 }}>🏫 {s.class} · 🚪 {s.room} · ⏰ {s.time}</div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <StatusBadge status={s.status} />
                {role === "teacher" && s.status !== "done" && <Button size="sm">📷 Bắt đầu điểm danh</Button>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );


  export default TodaySchedule;
  
import { useState, useEffect, useRef } from "react";
import {Button,ProgressBar,StatCard,StatusBadge} from '../../helper/helper'


const mockClasses = [
  { id: 1, name: "21SE1", course: "Lập trình Web", teacher: "TS. Trần Thị Lan", students: 32, room: "P201", schedule: "T2,T4 - Tiết 1-3" },
  { id: 2, name: "21SE2", course: "Cơ sở dữ liệu", teacher: "ThS. Nguyễn Văn Bình", students: 28, room: "P301", schedule: "T3,T5 - Tiết 4-6" },
  { id: 3, name: "22IT1", course: "Lập trình Python", teacher: "TS. Trần Thị Lan", students: 35, room: "P202", schedule: "T2,T6 - Tiết 4-6" },
  { id: 4, name: "22IT2", course: "Mạng máy tính", teacher: "PGS. Lê Thị Cúc", students: 30, room: "P401", schedule: "T4,T6 - Tiết 1-3" },
];

const mockScheduleToday = [
  { id: 1, time: "07:00 - 09:30", subject: "Lập trình Web", class: "21SE1", room: "P201", period: "Tiết 1-3", status: "upcoming" },
  { id: 2, time: "09:45 - 12:15", subject: "Lập trình Python", class: "22IT1", room: "P202", period: "Tiết 4-6", status: "ongoing" },
  { id: 3, time: "13:00 - 15:30", subject: "Lập trình Web", class: "21SE2", room: "P301", period: "Tiết 7-9", status: "done" },
];

const TeacherDashboard = () => (
    <div>
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <StatCard icon="📅" label="Buổi dạy hôm nay" value="3" color="#3b82f6" />
        <StatCard icon="🎓" label="Tổng sinh viên phụ trách" value="95" color="#10b981" />
        <StatCard icon="📊" label="Chuyên cần TB" value="85.4%" color="#f59e0b" />
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">📋 Lịch dạy hôm nay</span></div>
          <div style={{ padding: 0 }}>
            {mockScheduleToday.map(s => (
              <div key={s.id} style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{s.subject}</div>
                    <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 4 }}>🏫 {s.class} · 🚪 {s.room} · ⏰ {s.time}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <StatusBadge status={s.status} />
                    {s.status === "upcoming" && <Button size="sm">📷 Điểm danh</Button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">📊 Chuyên cần theo lớp</span></div>
          <div className="card-body">
            {mockClasses.slice(0, 3).map(c => (
              <div key={c.id} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div><span style={{ fontWeight: 700 }}>{c.name}</span> <span style={{ fontSize: 12.5, color: "var(--text2)" }}>- {c.course}</span></div>
                  <span style={{ fontWeight: 700, color: "var(--primary)" }}>87%</span>
                </div>
                <ProgressBar value={87} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  export default TeacherDashboard;
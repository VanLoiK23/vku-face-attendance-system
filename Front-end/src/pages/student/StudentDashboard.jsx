import { useState, useEffect, useRef } from "react";
import {Avatar,StatCard,StatusBadge} from '../../helper/helper'


const mockStudentAttendance = [
  { date: "05/05/2026", subject: "Lập trình Web", status: "present", time: "07:02" },
  { date: "04/05/2026", subject: "Cơ sở dữ liệu", status: "absent", time: "-" },
  { date: "03/05/2026", subject: "Lập trình Web", status: "present", time: "07:00" },
  { date: "02/05/2026", subject: "Cơ sở dữ liệu", status: "present", time: "09:47" },
  { date: "01/05/2026", subject: "Lập trình Web", status: "late", time: "07:18" },
  { date: "30/04/2026", subject: "Cơ sở dữ liệu", status: "present", time: "09:45" },
];


const mockScheduleToday = [
  { id: 1, time: "07:00 - 09:30", subject: "Lập trình Web", class: "21SE1", room: "P201", period: "Tiết 1-3", status: "upcoming" },
  { id: 2, time: "09:45 - 12:15", subject: "Lập trình Python", class: "22IT1", room: "P202", period: "Tiết 4-6", status: "ongoing" },
  { id: 3, time: "13:00 - 15:30", subject: "Lập trình Web", class: "21SE2", room: "P301", period: "Tiết 7-9", status: "done" },
];


const StudentDashboard = () => {
    const rate = 87;
    return (
      <div>
        <div style={{ background: "linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-light) 60%, var(--accent) 100%)", borderRadius: "var(--radius)", padding: "28px 32px", marginBottom: 24, color: "white", display: "flex", alignItems: "center", gap: 28 }}>
          <Avatar initials="LMK" size="xl" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 800 }}>Chào buổi sáng, Lê Minh Khoa! 👋</div>
            <div style={{ fontSize: 14, opacity: 0.8, marginTop: 4 }}>21IT001 · Lớp 21SE1 · Hôm nay Thứ Ba, 05/05/2026</div>
          </div>
          <div style={{ textAlign: "center", background: "rgba(255,255,255,0.15)", padding: "20px 28px", borderRadius: 16 }}>
            <div style={{ fontSize: 42, fontWeight: 900 }}>{rate}%</div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>Chuyên cần</div>
          </div>
        </div>
  
        <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          <StatCard icon="📅" label="Buổi học hôm nay" value="3" color="#3b82f6" />
          <StatCard icon="✅" label="Tổng buổi có mặt" value="42" color="#10b981" />
          <StatCard icon="❌" label="Tổng buổi vắng" value="6" color="#ef4444" />
        </div>
  
        <div className="grid-2">
          <div className="card">
            <div className="card-header"><span className="card-title">📋 Lịch học hôm nay</span></div>
            {mockScheduleToday.map(s => (
              <div key={s.id} style={{ padding: "14px 20px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{s.subject}</div>
                  <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 3 }}>⏰ {s.time} · 🚪 {s.room} · {s.period}</div>
                </div>
                <StatusBadge status={s.status} />
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">📊 Điểm danh gần đây</span></div>
            {mockStudentAttendance.slice(0, 5).map((a, i) => (
              <div key={i} style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{a.subject}</div>
                  <div style={{ fontSize: 12, color: "var(--text3)" }}>{a.date}</div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "var(--text2)", fontFamily: "JetBrains Mono, monospace" }}>{a.time}</span>
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
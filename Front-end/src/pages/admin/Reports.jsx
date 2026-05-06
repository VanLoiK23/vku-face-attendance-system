
import { useState, useEffect, useRef } from "react";
import {Avatar,Button,ProgressBar} from '../../helper/helper'


const mockClasses = [
  { id: 1, name: "21SE1", course: "Lập trình Web", teacher: "TS. Trần Thị Lan", students: 32, room: "P201", schedule: "T2,T4 - Tiết 1-3" },
  { id: 2, name: "21SE2", course: "Cơ sở dữ liệu", teacher: "ThS. Nguyễn Văn Bình", students: 28, room: "P301", schedule: "T3,T5 - Tiết 4-6" },
  { id: 3, name: "22IT1", course: "Lập trình Python", teacher: "TS. Trần Thị Lan", students: 35, room: "P202", schedule: "T2,T6 - Tiết 4-6" },
  { id: 4, name: "22IT2", course: "Mạng máy tính", teacher: "PGS. Lê Thị Cúc", students: 30, room: "P401", schedule: "T4,T6 - Tiết 1-3" },
];

const mockStudents = [
  { id: 1, name: "Lê Minh Khoa", studentId: "21IT001", email: "khoa@vku.udn.vn", class: "21SE1", avatar: "LMK", faceStatus: "approved", attendanceRate: 92 },
  { id: 2, name: "Nguyễn Thị Hoa", studentId: "21IT002", email: "hoa@vku.udn.vn", class: "21SE1", avatar: "NTH", faceStatus: "approved", attendanceRate: 78 },
  { id: 3, name: "Phạm Văn Đức", studentId: "21IT003", email: "duc@vku.udn.vn", class: "21SE1", avatar: "PVD", faceStatus: "pending", attendanceRate: 65 },
  { id: 4, name: "Võ Thị Mai", studentId: "21IT004", email: "mai@vku.udn.vn", class: "21SE2", avatar: "VTM", faceStatus: "approved", attendanceRate: 88 },
  { id: 5, name: "Đỗ Quang Hưng", studentId: "21IT005", email: "hung@vku.udn.vn", class: "21SE2", avatar: "DQH", faceStatus: "rejected", attendanceRate: 55 },
  { id: 6, name: "Trần Minh Tuấn", studentId: "21IT006", email: "tuan@vku.udn.vn", class: "21SE1", avatar: "TMT", faceStatus: "approved", attendanceRate: 95 },
];

const ReportsPage = () => (
    <div>
      <div className="grid-2 mb-5">
        <div className="card">
          <div className="card-header"><span className="card-title">📊 Top sinh viên nghỉ nhiều</span></div>
          <div style={{ padding: 0 }}>
            {mockStudents.sort((a,b) => a.attendanceRate - b.attendanceRate).slice(0, 5).map((s, i) => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ width: 28, height: 28, borderRadius: 50, background: i === 0 ? "var(--danger)" : "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: i === 0 ? "white" : "var(--text2)" }}>{i+1}</div>
                <Avatar initials={s.avatar} size="sm" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text3)" }}>{s.class} · {s.studentId}</div>
                </div>
                <div style={{ fontWeight: 700, color: "var(--danger)" }}>{s.attendanceRate}%</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">📈 Tỷ lệ đi học theo lớp</span></div>
          <div className="card-body">
            {mockClasses.map(c => (
              <div key={c.id} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 13.5 }}>{c.name} - {c.course}</span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: "var(--primary)" }}>87%</span>
                </div>
                <ProgressBar value={87} />
              </div>
            ))}
          </div>
        </div>
      </div>
  
      <div className="card">
        <div className="card-header"><span className="card-title">📋 Xuất báo cáo</span>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="ghost" size="sm">📥 Excel</Button>
            <Button variant="ghost" size="sm">📄 PDF</Button>
          </div>
        </div>
        <div className="card-body">
          <div className="grid-3">
            {[
              { icon: "📊", title: "Báo cáo chuyên cần", desc: "Theo lớp, theo tuần/tháng" },
              { icon: "👤", title: "Báo cáo sinh viên", desc: "Danh sách, trạng thái điểm danh" },
              { icon: "📅", title: "Báo cáo lịch học", desc: "Theo giảng viên, theo phòng" },
            ].map((r, i) => (
              <div key={i} style={{ background: "var(--bg)", borderRadius: 12, padding: 20, cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--primary)"}
                onMouseLeave={e => e.currentTarget.style.background = "var(--bg)"}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>{r.icon}</div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{r.title}</div>
                <div style={{ fontSize: 12.5, color: "var(--text2)" }}>{r.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );


  export default ReportsPage;
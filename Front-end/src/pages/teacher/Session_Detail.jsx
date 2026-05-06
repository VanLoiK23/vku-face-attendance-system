import { useState, useEffect, useRef } from "react";
import {Avatar,Button,ProgressBar,StatusBadge} from '../../helper/helper'


const mockSessionDetail = {
  date: "05/05/2026",
  subject: "Lập trình Web",
  class: "21SE1",
  room: "P201",
  teacher: "TS. Trần Thị Lan",
  period: "Tiết 1-3 (07:00 - 09:30)",
  students: [
    { id: 1, name: "Lê Minh Khoa", studentId: "21IT001", status: "present", time: "07:02", confidence: 98.2 },
    { id: 2, name: "Nguyễn Thị Hoa", studentId: "21IT002", status: "present", time: "07:05", confidence: 96.7 },
    { id: 3, name: "Phạm Văn Đức", studentId: "21IT003", status: "absent", time: "-", confidence: null },
    { id: 4, name: "Trần Minh Tuấn", studentId: "21IT006", status: "present", time: "07:01", confidence: 99.1 },
    { id: 5, name: "Đỗ Quang Hưng", studentId: "21IT005", status: "late", time: "07:22", confidence: 94.5 },
  ],
};

const SessionDetail = () => (
    <div>
      <div className="card mb-5">
        <div style={{ background: "linear-gradient(135deg, var(--primary-dark), var(--accent))", padding: "24px 28px", color: "white" }}>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>{mockSessionDetail.subject}</div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[["🏫", "Lớp", mockSessionDetail.class], ["🚪", "Phòng", mockSessionDetail.room], ["⏰", "Thời gian", mockSessionDetail.period], ["👨‍🏫", "Giảng viên", mockSessionDetail.teacher]].map(([icon, label, val]) => (
              <div key={label}><div style={{ fontSize: 11, opacity: 0.7 }}>{icon} {label}</div><div style={{ fontWeight: 700, fontSize: 15 }}>{val}</div></div>
            ))}
          </div>
        </div>
        <div style={{ padding: "14px 28px", display: "flex", gap: 24, background: "var(--surface2)" }}>
          {[
            { label: "Tổng sinh viên", value: mockSessionDetail.students.length, color: "var(--primary)" },
            { label: "Có mặt", value: mockSessionDetail.students.filter(s => s.status === "present").length, color: "var(--success)" },
            { label: "Vắng", value: mockSessionDetail.students.filter(s => s.status === "absent").length, color: "var(--danger)" },
            { label: "Trễ", value: mockSessionDetail.students.filter(s => s.status === "late").length, color: "var(--warning)" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center", flex: 1 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "var(--text2)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="card-header"><span className="card-title">📋 Danh sách điểm danh</span>
          <Button variant="ghost" size="sm">📥 Xuất Excel</Button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Sinh viên</th><th>Mã SV</th><th>Trạng thái</th><th>Giờ điểm danh</th><th>Độ tin cậy AI</th><th>Ảnh</th></tr></thead>
            <tbody>
              {mockSessionDetail.students.map(s => (
                <tr key={s.id}>
                  <td><div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar initials={s.name.split(" ").map(w => w[0]).join("").slice(-2)} size="sm" />
                    <span style={{ fontWeight: 600 }}>{s.name}</span>
                  </div></td>
                  <td><code style={{ background: "var(--bg)", padding: "2px 8px", borderRadius: 6, fontSize: 12 }}>{s.studentId}</code></td>
                  <td><StatusBadge status={s.status} /></td>
                  <td style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 600 }}>{s.time}</td>
                  <td>{s.confidence ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <ProgressBar value={s.confidence} color={s.confidence > 95 ? "var(--success)" : "var(--warning)"} />
                      <span style={{ fontSize: 12, fontWeight: 700 }}>{s.confidence}%</span>
                    </div>
                  ) : <span style={{ color: "var(--text3)" }}>—</span>}</td>
                  <td>{s.status !== "absent" ? <div style={{ width: 40, height: 40, background: "var(--bg2)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>🧑</div> : <span style={{ color: "var(--text3)" }}>—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );


  export default SessionDetail;
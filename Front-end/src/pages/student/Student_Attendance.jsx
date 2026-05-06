import { useState, useEffect, useRef } from "react";
import {StatusBadge} from '../../helper/helper'


const mockStudentAttendance = [
  { date: "05/05/2026", subject: "Lập trình Web", status: "present", time: "07:02" },
  { date: "04/05/2026", subject: "Cơ sở dữ liệu", status: "absent", time: "-" },
  { date: "03/05/2026", subject: "Lập trình Web", status: "present", time: "07:00" },
  { date: "02/05/2026", subject: "Cơ sở dữ liệu", status: "present", time: "09:47" },
  { date: "01/05/2026", subject: "Lập trình Web", status: "late", time: "07:18" },
  { date: "30/04/2026", subject: "Cơ sở dữ liệu", status: "present", time: "09:45" },
];


const MyAttendance = () => (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, background: "var(--success)", borderRadius: 12, padding: "16px 20px", color: "white", textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 800 }}>42</div>
          <div style={{ fontSize: 13, opacity: 0.85 }}>Buổi có mặt</div>
        </div>
        <div style={{ flex: 1, background: "var(--danger)", borderRadius: 12, padding: "16px 20px", color: "white", textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 800 }}>6</div>
          <div style={{ fontSize: 13, opacity: 0.85 }}>Buổi vắng</div>
        </div>
        <div style={{ flex: 1, background: "var(--warning)", borderRadius: 12, padding: "16px 20px", color: "white", textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 800 }}>2</div>
          <div style={{ fontSize: 13, opacity: 0.85 }}>Buổi trễ</div>
        </div>
        <div style={{ flex: 1, background: "var(--primary)", borderRadius: 12, padding: "16px 20px", color: "white", textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 800 }}>87%</div>
          <div style={{ fontSize: 13, opacity: 0.85 }}>Chuyên cần</div>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">📜 Lịch sử điểm danh</span>
          <select className="form-input form-select" style={{ width: 180, fontSize: 13, padding: "6px 12px" }}><option>Tất cả môn</option><option>Lập trình Web</option><option>Cơ sở dữ liệu</option></select>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Ngày</th><th>Môn học</th><th>Giờ điểm danh</th><th>Trạng thái</th></tr></thead>
            <tbody>
              {mockStudentAttendance.map((a, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{a.date}</td>
                  <td>{a.subject}</td>
                  <td style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 600 }}>{a.time}</td>
                  <td><StatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );


  export default MyAttendance;
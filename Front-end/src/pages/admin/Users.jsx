import { useState, useEffect, useRef } from "react";
import {Avatar,Badge,Button,ProgressBar,Modal,StatusBadge} from '../../helper/helper'

const UsersPage = () => {
    const [tab, setTab] = useState("students");
    const [showModal, setShowModal] = useState(false);


    const mockStudents = [
        { id: 1, name: "Lê Minh Khoa", studentId: "21IT001", email: "khoa@vku.udn.vn", class: "21SE1", avatar: "LMK", faceStatus: "approved", attendanceRate: 92 },
        { id: 2, name: "Nguyễn Thị Hoa", studentId: "21IT002", email: "hoa@vku.udn.vn", class: "21SE1", avatar: "NTH", faceStatus: "approved", attendanceRate: 78 },
        { id: 3, name: "Phạm Văn Đức", studentId: "21IT003", email: "duc@vku.udn.vn", class: "21SE1", avatar: "PVD", faceStatus: "pending", attendanceRate: 65 },
        { id: 4, name: "Võ Thị Mai", studentId: "21IT004", email: "mai@vku.udn.vn", class: "21SE2", avatar: "VTM", faceStatus: "approved", attendanceRate: 88 },
        { id: 5, name: "Đỗ Quang Hưng", studentId: "21IT005", email: "hung@vku.udn.vn", class: "21SE2", avatar: "DQH", faceStatus: "rejected", attendanceRate: 55 },
        { id: 6, name: "Trần Minh Tuấn", studentId: "21IT006", email: "tuan@vku.udn.vn", class: "21SE1", avatar: "TMT", faceStatus: "approved", attendanceRate: 95 },
      ];
      
      const mockTeachers = [
        { id: 1, name: "TS. Trần Thị Lan", email: "lan@vku.udn.vn", department: "CNTT", avatar: "TTL", courses: 3 },
        { id: 2, name: "ThS. Nguyễn Văn Bình", email: "binh@vku.udn.vn", department: "CNTT", avatar: "NVB", courses: 4 },
        { id: 3, name: "PGS. Lê Thị Cúc", email: "cuc@vku.udn.vn", department: "KTPM", avatar: "LTC", courses: 2 },
      ];

    return (
      <div>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <button className={`btn ${tab === "students" ? "btn-primary" : "btn-ghost"}`} onClick={() => setTab("students")}>🎓 Sinh viên ({mockStudents.length})</button>
          <button className={`btn ${tab === "teachers" ? "btn-primary" : "btn-ghost"}`} onClick={() => setTab("teachers")}>👨‍🏫 Giảng viên ({mockTeachers.length})</button>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <input className="form-input" style={{ width: 220 }} placeholder="🔍 Tìm kiếm..." />
            <Button onClick={() => setShowModal(true)}>+ Thêm mới</Button>
          </div>
        </div>
  
        {tab === "students" && (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead><tr><th>Sinh viên</th><th>Mã SV</th><th>Lớp</th><th>Email</th><th>Ảnh khuôn mặt</th><th>Chuyên cần</th><th>Thao tác</th></tr></thead>
                <tbody>
                  {mockStudents.map(s => (
                    <tr key={s.id}>
                      <td><div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar initials={s.avatar} size="sm" />
                        <span style={{ fontWeight: 600 }}>{s.name}</span>
                      </div></td>
                      <td><code style={{ background: "var(--bg)", padding: "2px 8px", borderRadius: 6, fontSize: 12 }}>{s.studentId}</code></td>
                      <td><Badge type="blue">{s.class}</Badge></td>
                      <td style={{ color: "var(--text2)", fontSize: 13 }}>{s.email}</td>
                      <td><StatusBadge status={s.faceStatus} /></td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 120 }}>
                          <ProgressBar value={s.attendanceRate} color={s.attendanceRate < 70 ? "var(--danger)" : "var(--success)"} />
                          <span style={{ fontSize: 12, fontWeight: 700 }}>{s.attendanceRate}%</span>
                        </div>
                      </td>
                      <td><div style={{ display: "flex", gap: 6 }}>
                        <Button variant="ghost" size="sm">✏️</Button>
                        <Button variant="ghost" size="sm">🗑️</Button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
  
        {tab === "teachers" && (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead><tr><th>Giảng viên</th><th>Email</th><th>Khoa</th><th>Số lớp</th><th>Thao tác</th></tr></thead>
                <tbody>
                  {mockTeachers.map(t => (
                    <tr key={t.id}>
                      <td><div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar initials={t.avatar} size="sm" />
                        <span style={{ fontWeight: 600 }}>{t.name}</span>
                      </div></td>
                      <td style={{ color: "var(--text2)", fontSize: 13 }}>{t.email}</td>
                      <td><Badge type="cyan">{t.department}</Badge></td>
                      <td style={{ fontWeight: 700 }}>{t.courses} lớp</td>
                      <td><div style={{ display: "flex", gap: 6 }}>
                        <Button variant="ghost" size="sm">✏️</Button>
                        <Button variant="ghost" size="sm">🗑️</Button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
  
        <Modal open={showModal} onClose={() => setShowModal(false)} title={`Thêm ${tab === "students" ? "Sinh viên" : "Giảng viên"}`}>
          <div className="form-group"><label className="form-label">Họ và tên</label><input className="form-input" placeholder="Nhập họ tên..." /></div>
          <div className="form-group"><label className="form-label">Email (@vku.udn.vn)</label><input className="form-input" placeholder="email@vku.udn.vn" /></div>
          {tab === "students" && <>
            <div className="form-group"><label className="form-label">Mã sinh viên</label><input className="form-input" placeholder="21ITxxx" /></div>
            <div className="form-group"><label className="form-label">Lớp</label>
              <select className="form-input form-select"><option>21SE1</option><option>21SE2</option><option>22IT1</option></select></div>
          </>}
          {tab === "teachers" && <>
            <div className="form-group"><label className="form-label">Khoa</label>
              <select className="form-input form-select"><option>CNTT</option><option>KTPM</option><option>HTTT</option></select></div>
          </>}
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <Button variant="ghost" onClick={() => setShowModal(false)} className="w-full">Hủy</Button>
            <Button className="w-full">Lưu</Button>
          </div>
        </Modal>
      </div>
    );
  };

  export default UsersPage;
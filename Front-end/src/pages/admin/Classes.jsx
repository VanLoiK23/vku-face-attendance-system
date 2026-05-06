import { useState, useEffect, useRef } from "react";
import {Avatar,Button,Modal} from '../../helper/helper'


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

const mockClasses = [
  { id: 1, name: "21SE1", course: "Lập trình Web", teacher: "TS. Trần Thị Lan", students: 32, room: "P201", schedule: "T2,T4 - Tiết 1-3" },
  { id: 2, name: "21SE2", course: "Cơ sở dữ liệu", teacher: "ThS. Nguyễn Văn Bình", students: 28, room: "P301", schedule: "T3,T5 - Tiết 4-6" },
  { id: 3, name: "22IT1", course: "Lập trình Python", teacher: "TS. Trần Thị Lan", students: 35, room: "P202", schedule: "T2,T6 - Tiết 4-6" },
  { id: 4, name: "22IT2", course: "Mạng máy tính", teacher: "PGS. Lê Thị Cúc", students: 30, room: "P401", schedule: "T4,T6 - Tiết 1-3" },
];


const ClassesPage = () => {
    const [showModal, setShowModal] = useState(false);
    const [selected, setSelected] = useState(null);
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <input className="form-input" style={{ width: 240 }} placeholder="🔍 Tìm lớp..." />
            <select className="form-input form-select" style={{ width: 160 }}><option>Tất cả khóa</option><option>Khóa 21</option><option>Khóa 22</option></select>
          </div>
          <Button onClick={() => setShowModal(true)}>+ Tạo lớp mới</Button>
        </div>
  
        <div className="grid-2">
          {mockClasses.map(c => (
            <div key={c.id} className="card" style={{ cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" }}
              onClick={() => setSelected(c)}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
              <div style={{ background: "linear-gradient(135deg, var(--primary-dark), var(--primary-light))", padding: "20px 22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "white" }}>{c.name}</div>
                    <div style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", marginTop: 4 }}>{c.course}</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.15)", padding: "8px 14px", borderRadius: 10 }}>
                    <div style={{ color: "white", fontWeight: 700, fontSize: 20 }}>{c.students}</div>
                    <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11 }}>Sinh viên</div>
                  </div>
                </div>
              </div>
              <div style={{ padding: "16px 22px" }}>
                <div style={{ display: "flex", gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: "var(--text3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.7px" }}>Giảng viên</div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 4 }}>{c.teacher}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: "var(--text3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.7px" }}>Phòng</div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 4 }}>{c.room}</div>
                  </div>
                </div>
                <div style={{ marginTop: 12, fontSize: 12, color: "var(--text2)", display: "flex", alignItems: "center", gap: 6 }}>
                  📅 {c.schedule}
                </div>
                <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                  <Button variant="primary" size="sm">Xem chi tiết</Button>
                  <Button variant="ghost" size="sm">Gán GV</Button>
                  <Button variant="ghost" size="sm">Thêm SV</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
  
        <Modal open={!!selected} onClose={() => setSelected(null)} title={`Chi tiết lớp ${selected?.name}`}>
          {selected && <>
            <div style={{ background: "var(--bg)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: "var(--text2)" }}>Môn học</div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{selected.course}</div>
              <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 8 }}>Giảng viên: <strong>{selected.teacher}</strong></div>
              <div style={{ fontSize: 13, color: "var(--text2)" }}>Phòng: <strong>{selected.room}</strong> · Lịch: <strong>{selected.schedule}</strong></div>
            </div>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Danh sách sinh viên ({selected.students})</div>
            {mockStudents.filter(s => s.class === selected.name).map(s => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                <Avatar initials={s.avatar} size="sm" />
                <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div><div style={{ fontSize: 12, color: "var(--text3)" }}>{s.studentId}</div></div>
                <div style={{ fontSize: 12, fontWeight: 700, color: s.attendanceRate >= 80 ? "var(--success)" : "var(--danger)" }}>{s.attendanceRate}%</div>
              </div>
            ))}
            <Button className="w-full mt-4" variant="ghost" onClick={() => setSelected(null)}>Đóng</Button>
          </>}
        </Modal>
  
        <Modal open={showModal} onClose={() => setShowModal(false)} title="Tạo lớp học mới">
          <div className="form-group"><label className="form-label">Tên lớp</label><input className="form-input" placeholder="Ví dụ: 21SE1" /></div>
          <div className="form-group"><label className="form-label">Môn học</label><input className="form-input" placeholder="Lập trình Web, CSDL..." /></div>
          <div className="form-group"><label className="form-label">Giảng viên</label>
            <select className="form-input form-select">{mockTeachers.map(t => <option key={t.id}>{t.name}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Phòng học</label><input className="form-input" placeholder="P201..." /></div>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <Button variant="ghost" onClick={() => setShowModal(false)} className="w-full">Hủy</Button>
            <Button className="w-full">Tạo lớp</Button>
          </div>
        </Modal>
      </div>
    );
  };

  export default ClassesPage;
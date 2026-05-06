import { useState, useEffect, useRef } from "react";
import {Avatar,Badge,Button,ProgressBar,StatCard,StatusBadge,AttendanceChart} from '../../helper/helper.jsx'


const AdminDashboard = () => {
    const chartData = [
      { label: "T2", value: 89 }, { label: "T3", value: 76 }, { label: "T4", value: 92 },
      { label: "T5", value: 85 }, { label: "T6", value: 78 }, { label: "T7", value: 65 },
    ];

    const mockStudents = [
      { id: 1, name: "Lê Minh Khoa", studentId: "21IT001", email: "khoa@vku.udn.vn", class: "21SE1", avatar: "LMK", faceStatus: "approved", attendanceRate: 92 },
      { id: 2, name: "Nguyễn Thị Hoa", studentId: "21IT002", email: "hoa@vku.udn.vn", class: "21SE1", avatar: "NTH", faceStatus: "approved", attendanceRate: 78 },
      { id: 3, name: "Phạm Văn Đức", studentId: "21IT003", email: "duc@vku.udn.vn", class: "21SE1", avatar: "PVD", faceStatus: "pending", attendanceRate: 65 },
      { id: 4, name: "Võ Thị Mai", studentId: "21IT004", email: "mai@vku.udn.vn", class: "21SE2", avatar: "VTM", faceStatus: "approved", attendanceRate: 88 },
      { id: 5, name: "Đỗ Quang Hưng", studentId: "21IT005", email: "hung@vku.udn.vn", class: "21SE2", avatar: "DQH", faceStatus: "rejected", attendanceRate: 55 },
      { id: 6, name: "Trần Minh Tuấn", studentId: "21IT006", email: "tuan@vku.udn.vn", class: "21SE1", avatar: "TMT", faceStatus: "approved", attendanceRate: 95 },
    ];

    const mockScheduleToday = [
      { id: 1, time: "07:00 - 09:30", subject: "Lập trình Web", class: "21SE1", room: "P201", period: "Tiết 1-3", status: "upcoming" },
      { id: 2, time: "09:45 - 12:15", subject: "Lập trình Python", class: "22IT1", room: "P202", period: "Tiết 4-6", status: "ongoing" },
      { id: 3, time: "13:00 - 15:30", subject: "Lập trình Web", class: "21SE2", room: "P301", period: "Tiết 7-9", status: "done" },
    ];

    return (
      <div>
        <div className="stats-grid">
          <StatCard icon="🎓" label="Tổng sinh viên" value="847" change="12 mới tháng này" changeUp color="#3b82f6" />
          <StatCard icon="🏫" label="Tổng lớp học" value="24" change="2 lớp mới" changeUp color="#06b6d4" />
          <StatCard icon="📅" label="Buổi học hôm nay" value="18" change="vs hôm qua" changeUp color="#10b981" />
          <StatCard icon="📊" label="Chuyên cần TB" value="87%" change="2.3% so tuần trước" changeUp color="#f59e0b" />
        </div>
  
        <div className="grid-2">
          <div className="card">
            <div className="card-header">
              <span className="card-title">📈 Tỷ lệ chuyên cần tuần này</span>
            </div>
            <div className="card-body">
              <AttendanceChart data={chartData} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                {chartData.map((d, i) => (
                  <div key={i} style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)" }}>{d.value}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
  
          <div className="card">
            <div className="card-header"><span className="card-title">🏫 Lớp đang học</span></div>
            <div className="card-body" style={{ padding: 0 }}>
              {mockScheduleToday.map(s => (
                <div key={s.id} style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{s.subject}</div>
                    <div style={{ fontSize: 12, color: "var(--text2)" }}>{s.class} · {s.room} · {s.time}</div>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
  
        <div className="card mt-4">
          <div className="card-header">
            <span className="card-title">⚠️ Sinh viên nghỉ nhiều nhất</span>
            <Button variant="ghost" size="sm">Xem tất cả</Button>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Sinh viên</th><th>Lớp</th><th>Số buổi vắng</th><th>Chuyên cần</th><th></th></tr></thead>
              <tbody>
                {mockStudents.sort((a, b) => a.attendanceRate - b.attendanceRate).slice(0, 5).map((s, i) => (
                  <tr key={s.id}>
                    <td style={{ color: "var(--text3)", fontWeight: 600 }}>{i + 1}</td>
                    <td><div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar initials={s.avatar} size="sm" />
                      <div><div style={{ fontWeight: 600 }}>{s.name}</div><div style={{ fontSize: 12, color: "var(--text3)" }}>{s.studentId}</div></div>
                    </div></td>
                    <td><Badge type="blue">{s.class}</Badge></td>
                    <td style={{ color: "var(--danger)", fontWeight: 700 }}>{Math.round((100 - s.attendanceRate) / 10 * 3)} buổi</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1 }}><ProgressBar value={s.attendanceRate} color={s.attendanceRate < 70 ? "var(--danger)" : s.attendanceRate < 85 ? "var(--warning)" : "var(--success)"} /></div>
                        <span style={{ fontSize: 12, fontWeight: 700, minWidth: 36 }}>{s.attendanceRate}%</span>
                      </div>
                    </td>
                    <td><Button variant="ghost" size="sm">Chi tiết</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  export default AdminDashboard;